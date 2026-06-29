using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NoorTrading.Server.Common;
using NoorTrading.Server.Data;
using NoorTrading.Server.Middleware;
using NoorTrading.Server.Repositories;
using NoorTrading.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// ── EF Core (SQLite — fichier local, zéro config) ───────────────────────────────
var connection = builder.Configuration.GetConnectionString("Default")
                 ?? "Data Source=noortrading.db";
builder.Services.AddDbContext<NoorTradingDbContext>(o => o.UseSqlite(connection));

// ── Options ─────────────────────────────────────────────────────────────────────
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

// ── DI : repositories + services métier ─────────────────────────────────────────
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<IFileStorage, FileStorage>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ITimelineService, TimelineService>();
builder.Services.AddScoped<IPublicContentService, PublicContentService>();

// ── Controllers + JSON + validation → enveloppe unifiée ─────────────────────────
builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.Configure<ApiBehaviorOptions>(o =>
{
    o.InvalidModelStateResponseFactory = ctx =>
    {
        var errors = ctx.ModelState
            .Where(kv => kv.Value?.Errors.Count > 0)
            .SelectMany(kv => kv.Value!.Errors.Select(e => e.ErrorMessage))
            .ToArray();
        return new BadRequestObjectResult(
            ApiResponse.Fail("Données invalides.", errors));
    };
});

builder.Services.AddOpenApi();

// ── JWT Bearer ──────────────────────────────────────────────────────────────────
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
            ClockSkew = TimeSpan.FromSeconds(15),
        };
    });
builder.Services.AddAuthorization();

// ── CORS (dev : client Vite) ─────────────────────────────────────────────────────
const string CorsPolicy = "spa";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p =>
    p.WithOrigins(
        builder.Configuration["ClientOrigin"] ?? "https://localhost:64354")
     .AllowAnyHeader()
     .AllowAnyMethod()));

// ── Rate limiting : protège POST /api/analytics/visit (par IP) ──────────────────
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("analytics", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

var app = builder.Build();

// ── Pipeline ──────────────────────────────────────────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

// ── Migrations + seed au démarrage ──────────────────────────────────────────────
await DbInitializer.InitializeAsync(app.Services, app.Configuration);

app.Run();
