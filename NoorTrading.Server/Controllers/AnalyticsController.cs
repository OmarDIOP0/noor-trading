using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController(IAnalyticsService analytics) : ControllerBase
{
    /// <summary>PUBLIC — appelé par la vitrine à chaque chargement de page. Rate-limité par IP.</summary>
    [HttpPost("visit")]
    [AllowAnonymous]
    [EnableRateLimiting("analytics")]
    public async Task<ActionResult<ApiResponse>> TrackVisit(TrackVisitRequest req)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await analytics.TrackVisitAsync(req, ip);
        return Ok(ApiResponse.Ok());
    }

    /// <summary>ADMIN — agrégats du dashboard.</summary>
    [HttpGet("stats")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<AnalyticsStats>>> Stats([FromQuery] string range = "30d")
    {
        var parsed = range.ToLowerInvariant() switch
        {
            "7d" or "7j" => StatsRange.Last7Days,
            "all" or "tout" => StatsRange.All,
            _ => StatsRange.Last30Days,
        };
        return Ok(ApiResponse<AnalyticsStats>.Ok(await analytics.GetStatsAsync(parsed)));
    }
}
