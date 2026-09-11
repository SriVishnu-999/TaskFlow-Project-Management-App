using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Entities;
using TaskFlow.Core.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly TaskFlowDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICurrentUserService _currentUserService;

    public AuthService(
        TaskFlowDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentUserService = currentUserService;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
        if (existingUser)
        {
            return Result<AuthResponse>.Fail("An account with this email already exists.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Developer" : request.Role,
            AvatarUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(request.FullName)}"
        };

        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.GenerateToken(user);
        var userDto = new UserProfileDto(user.Id, user.FullName, user.Email, user.Role, user.AvatarUrl);

        return Result<AuthResponse>.Ok(new AuthResponse(token, userDto));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Fail("Invalid email or password.");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);
        var userDto = new UserProfileDto(user.Id, user.FullName, user.Email, user.Role, user.AvatarUrl);

        return Result<AuthResponse>.Ok(new AuthResponse(token, userDto));
    }

    public async Task<Result<UserProfileDto>> GetCurrentUserProfileAsync(CancellationToken cancellationToken = default)
    {
        if (_currentUserService.UserId == null)
        {
            return Result<UserProfileDto>.Fail("User is not authenticated.");
        }

        var user = await _context.Users.FindAsync(new object[] { _currentUserService.UserId.Value }, cancellationToken);
        if (user == null)
        {
            return Result<UserProfileDto>.Fail("User not found.");
        }

        return Result<UserProfileDto>.Ok(new UserProfileDto(user.Id, user.FullName, user.Email, user.Role, user.AvatarUrl));
    }

    public async Task<IReadOnlyList<UserProfileDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .Select(u => new UserProfileDto(u.Id, u.FullName, u.Email, u.Role, u.AvatarUrl))
            .ToListAsync(cancellationToken);
    }
}
