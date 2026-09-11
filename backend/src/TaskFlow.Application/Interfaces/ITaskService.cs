using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;
using TaskFlow.Core.Enums;

namespace TaskFlow.Application.Interfaces;

public interface ITaskService
{
    Task<Result<TaskDto>> GetTaskByIdAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskDto>> GetTasksByProjectAsync(Guid projectId, string? search = null, TaskPriority? priority = null, TaskItemStatus? status = null, Guid? assigneeId = null, CancellationToken cancellationToken = default);
    Task<Result<TaskDto>> CreateTaskAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<Result<TaskDto>> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default);
    Task<Result<TaskDto>> MoveTaskAsync(Guid taskId, MoveTaskRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskActivityDto>> GetTaskActivitiesAsync(Guid taskId, CancellationToken cancellationToken = default);
}
