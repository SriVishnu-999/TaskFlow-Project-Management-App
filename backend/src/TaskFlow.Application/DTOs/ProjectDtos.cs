using System.ComponentModel.DataAnnotations;
using TaskFlow.Core.Enums;

namespace TaskFlow.Application.DTOs;

public record ProjectDto(
    Guid Id,
    string Name,
    string Key,
    string? Description,
    Guid OwnerId,
    string OwnerName,
    int TaskCount,
    int BoardCount,
    DateTime CreatedAt
);

public record CreateProjectRequest(
    [Required, MinLength(2)] string Name,
    [Required, MinLength(2), MaxLength(5)] string Key,
    string? Description
);

public record UpdateProjectRequest(
    [Required, MinLength(2)] string Name,
    string? Description
);

public record ProjectMemberDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string Email,
    ProjectRole Role
);
