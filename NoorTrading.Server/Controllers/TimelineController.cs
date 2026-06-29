using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/timeline")]
public class TimelineController(ITimelineService timeline) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TimelineEntryDto>>>> GetAll() =>
        Ok(ApiResponse<IReadOnlyList<TimelineEntryDto>>.Ok(await timeline.GetAllAsync()));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TimelineEntryDto>>> Create(TimelineEntryInput req) =>
        Ok(ApiResponse<TimelineEntryDto>.Ok(await timeline.CreateAsync(req), "Étape créée."));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TimelineEntryDto>>> Update(Guid id, TimelineEntryInput req) =>
        Ok(ApiResponse<TimelineEntryDto>.Ok(await timeline.UpdateAsync(id, req), "Étape mise à jour."));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        await timeline.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Étape supprimée."));
    }
}
