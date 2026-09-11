using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Application.DTOs;

public record RegisterRequest(
    [Required, MinLength(2)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    string? Role = "Developer"
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    UserProfileDto User
);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    string? AvatarUrl
);
