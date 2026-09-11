using System.ComponentModel.DataAnnotations;
using TaskFlow.Core.Enums;

namespace TaskFlow.Application.DTOs;

public record BoardDto(
    Guid Id,
    Guid ProjectId,
    string Name,
    string? Description,
    int OrderIndex,
    List<BoardColumnDto> Columns
);

public record BoardColumnDto(
    Guid Id,
    Guid BoardId,
    string Name,
    int OrderIndex,
    TaskItemStatus StatusMapping,
    List<TaskDto> Tasks
);

public record CreateBoardRequest(
    [Required, MinLength(2)] string Name,
    string? Description,
    Guid ProjectId
);

public record CreateColumnRequest(
    [Required, MinLength(2)] string Name,
    TaskItemStatus StatusMapping
);

public record UpdateColumnRequest(
    [Required, MinLength(2)] string Name,
    int OrderIndex,
    TaskItemStatus StatusMapping
);
