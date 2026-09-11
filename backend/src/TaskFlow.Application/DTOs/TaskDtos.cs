using System.ComponentModel.DataAnnotations;
using TaskFlow.Core.Enums;

namespace TaskFlow.Application.DTOs;

public record TaskDto(
    Guid Id,
    string TaskKey,
    string Title,
    string? Description,
    TaskPriority Priority,
    TaskItemStatus Status,
    int OrderIndex,
    Guid BoardColumnId,
    Guid ProjectId,
    Guid ReporterId,
    string ReporterName,
    Guid? AssigneeId,
    string? AssigneeName,
    DateTime? DueDate,
    int StoryPoints,
    List<string> Tags,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateTaskRequest(
    [Required, MinLength(3)] string Title,
    string? Description,
    TaskPriority Priority,
    TaskItemStatus Status,
    Guid BoardColumnId,
    Guid ProjectId,
    Guid? AssigneeId,
    DateTime? DueDate,
    int StoryPoints = 1,
    List<string>? Tags = null
);

public record UpdateTaskRequest(
    [Required, MinLength(3)] string Title,
    string? Description,
    TaskPriority Priority,
    TaskItemStatus Status,
    Guid BoardColumnId,
    Guid? AssigneeId,
    DateTime? DueDate,
    int StoryPoints,
    List<string>? Tags
);

public record MoveTaskRequest(
    Guid TargetColumnId,
    int NewOrderIndex,
    TaskItemStatus NewStatus
);

public record TaskActivityDto(
    Guid Id,
    Guid TaskId,
    Guid UserId,
    string UserName,
    string Action,
    string Description,
    DateTime CreatedAt
);
