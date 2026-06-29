using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController(IProfileService profile) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<ProfileDto>>> Get() =>
        Ok(ApiResponse<ProfileDto>.Ok(await profile.GetAsync()));

    [HttpPut]
    public async Task<ActionResult<ApiResponse<ProfileDto>>> Update(UpdateProfileRequest req) =>
        Ok(ApiResponse<ProfileDto>.Ok(await profile.UpdateAsync(req), "Profil mis à jour."));

    [HttpPost("photo")]
    public async Task<ActionResult<ApiResponse<object>>> UploadPhoto(IFormFile photo) =>
        Ok(ApiResponse<object>.Ok(new { url = await profile.UpdatePhotoAsync(photo) }));
}
