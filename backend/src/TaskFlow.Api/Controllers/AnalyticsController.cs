using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.Api.Controllers;

public class AnalyticsController : BaseApiController
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<ProjectAnalyticsDto>> GetProjectAnalytics(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetProjectAnalyticsAsync(projectId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("global")]
    public async Task<ActionResult<ProjectAnalyticsDto>> GetGlobalAnalytics(CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetGlobalAnalyticsAsync(cancellationToken);
        return HandleResult(result);
    }
}
