using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/projects")]
public class ProjectsController(IProjectService projects) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<Paged<ProjectDto>>>> GetAll(
        [FromQuery] string? category, [FromQuery] ProjectStatus? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await projects.GetAllAsync(new ProjectsFilter(category, status, page, pageSize));
        return Ok(ApiResponse<Paged<ProjectDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> GetById(Guid id) =>
        Ok(ApiResponse<ProjectDto>.Ok(await projects.GetByIdAsync(id)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> Create(CreateProjectRequest req) =>
        Ok(ApiResponse<ProjectDto>.Ok(await projects.CreateAsync(req), "Réalisation créée."));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> Update(Guid id, UpdateProjectRequest req) =>
        Ok(ApiResponse<ProjectDto>.Ok(await projects.UpdateAsync(id, req), "Réalisation mise à jour."));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        await projects.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Réalisation supprimée."));
    }

    // ── Images ───────────────────────────────────────────────────────────────
    [HttpPost("{id:guid}/images")]
    public async Task<ActionResult<ApiResponse<ProjectImageDto>>> AddImage(
        Guid id, IFormFile photo, [FromForm] ImagePhase phase = ImagePhase.Apres) =>
        Ok(ApiResponse<ProjectImageDto>.Ok(await projects.AddImageAsync(id, photo, phase)));

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteImage(Guid id, Guid imageId)
    {
        await projects.DeleteImageAsync(id, imageId);
        return Ok(ApiResponse.Ok("Image supprimée."));
    }

    [HttpPut("{id:guid}/images/{imageId:guid}/cover")]
    public async Task<ActionResult<ApiResponse>> SetCover(Guid id, Guid imageId)
    {
        await projects.SetCoverAsync(id, imageId);
        return Ok(ApiResponse.Ok("Image de couverture définie."));
    }
}
