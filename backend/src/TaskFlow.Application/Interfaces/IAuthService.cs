using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;

namespace TaskFlow.Application.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<Result<UserProfileDto>> GetCurrentUserProfileAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserProfileDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
}
