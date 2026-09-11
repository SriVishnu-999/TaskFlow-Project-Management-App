using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;

namespace TaskFlow.Application.Interfaces;

public interface IAnalyticsService
{
    Task<Result<ProjectAnalyticsDto>> GetProjectAnalyticsAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<Result<ProjectAnalyticsDto>> GetGlobalAnalyticsAsync(CancellationToken cancellationToken = default);
}
