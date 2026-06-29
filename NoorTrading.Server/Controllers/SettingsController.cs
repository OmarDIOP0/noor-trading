using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/settings")]
public class SettingsController(ISettingsService settings) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<AppSettingsDto>>> Get() =>
        Ok(ApiResponse<AppSettingsDto>.Ok(await settings.GetAsync()));

    [HttpPut]
    public async Task<ActionResult<ApiResponse<AppSettingsDto>>> Update(UpdateSettingsRequest req) =>
        Ok(ApiResponse<AppSettingsDto>.Ok(await settings.UpdateAsync(req), "Paramètres enregistrés."));

    [HttpPost("logo")]
    public async Task<ActionResult<ApiResponse<object>>> UploadLogo(IFormFile logo) =>
        Ok(ApiResponse<object>.Ok(new { url = await settings.UpdateLogoAsync(logo) }));
}
