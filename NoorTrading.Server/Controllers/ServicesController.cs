using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoorTrading.Server.Common;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Services;

namespace NoorTrading.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/services")]
public class ServicesController(IServiceCatalogService services) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ServiceDto>>>> GetAll() =>
        Ok(ApiResponse<IReadOnlyList<ServiceDto>>.Ok(await services.GetAllAsync()));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ServiceDto>>> Create(CreateServiceRequest req) =>
        Ok(ApiResponse<ServiceDto>.Ok(await services.CreateAsync(req), "Service créé."));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceDto>>> Update(Guid id, UpdateServiceRequest req) =>
        Ok(ApiResponse<ServiceDto>.Ok(await services.UpdateAsync(id, req), "Service mis à jour."));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        await services.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Service supprimé."));
    }
}
