namespace NoorTrading.Server.Common;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "NoorTrading";
    public string Audience { get; set; } = "NoorTrading";
    public string Secret { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 60;
    public int RefreshTokenDays { get; set; } = 14;
}
