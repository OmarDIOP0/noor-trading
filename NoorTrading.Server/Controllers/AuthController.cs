using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResult>>> Login(LoginRequest req) =>
        Ok(ApiResponse<AuthResult>.Ok(await auth.LoginAsync(req)));

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<AuthTokens>>> Refresh(RefreshRequest req) =>
        Ok(ApiResponse<AuthTokens>.Ok(await auth.RefreshAsync(req)));

    [Authorize]
    [HttpGet("me")]
    public ActionResult<ApiResponse<AdminUserDto>> Me()
    {
        var id = currentUser.Id ?? throw AppException.Unauthorized();
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                    ?? User.FindFirst("email")?.Value ?? "";
        return Ok(ApiResponse<AdminUserDto>.Ok(
            new AdminUserDto(id, email, User.Identity?.Name ?? "")));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse>> ChangePassword(ChangePasswordRequest req)
    {
        var id = currentUser.Id ?? throw AppException.Unauthorized();
        await auth.ChangePasswordAsync(id, req);
        return Ok(ApiResponse.Ok("Mot de passe mis à jour."));
    }
}
