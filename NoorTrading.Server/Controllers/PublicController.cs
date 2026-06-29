using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

/// <summary>Lecture seule, anonyme — alimente la vitrine publique.</summary>
[ApiController]
[AllowAnonymous]
[Route("api/public")]
public class PublicController(IPublicContentService content) : ControllerBase
{
    /// <summary>Tout le contenu « above the fold » en un appel (settings + profil + services + timeline).</summary>
    [HttpGet("bundle")]
    public async Task<ActionResult<ApiResponse<PublicBundleDto>>> Bundle() =>
        Ok(ApiResponse<PublicBundleDto>.Ok(await content.GetBundleAsync()));

    [HttpGet("services")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PublicServiceDto>>>> Services() =>
        Ok(ApiResponse<IReadOnlyList<PublicServiceDto>>.Ok(await content.GetServicesAsync()));

    [HttpGet("projects")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PublicProjectDto>>>> Projects([FromQuery] string? category) =>
        Ok(ApiResponse<IReadOnlyList<PublicProjectDto>>.Ok(await content.GetProjectsAsync(category)));

    [HttpGet("projects/{id:guid}")]
    public async Task<ActionResult<ApiResponse<PublicProjectDto>>> Project(Guid id) =>
        Ok(ApiResponse<PublicProjectDto>.Ok(await content.GetProjectAsync(id)));

    [HttpGet("timeline")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TimelineEntryDto>>>> Timeline() =>
        Ok(ApiResponse<IReadOnlyList<TimelineEntryDto>>.Ok(await content.GetTimelineAsync()));
}
