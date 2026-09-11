using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Entities;
using TaskFlow.Core.Enums;
using TaskFlow.Core.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly TaskFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ProjectService(TaskFlowDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<ProjectDto>> GetUserProjectsAsync(CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;

        var query = _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Boards)
            .Include(p => p.Tasks)
            .AsNoTracking();

        if (currentUserId.HasValue)
        {
            query = query.Where(p => p.OwnerId == currentUserId.Value || p.Members.Any(m => m.UserId == currentUserId.Value));
        }

        var projects = await query.ToListAsync(cancellationToken);

        return projects.Select(p => new ProjectDto(
            p.Id,
            p.Name,
            p.Key,
            p.Description,
            p.OwnerId,
            p.Owner != null ? p.Owner.FullName : "System",
            p.Tasks.Count,
            p.Boards.Count,
            p.CreatedAt
        )).ToList();
    }

    public async Task<Result<ProjectDto>> GetProjectByIdAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Tasks)
            .Include(p => p.Boards)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return Result<ProjectDto>.Fail("Project not found.");
        }

        return Result<ProjectDto>.Ok(new ProjectDto(
            project.Id,
            project.Name,
            project.Key,
            project.Description,
            project.OwnerId,
            project.Owner != null ? project.Owner.FullName : "System",
            project.Tasks.Count,
            project.Boards.Count,
            project.CreatedAt
        ));
    }

    public async Task<Result<ProjectDto>> CreateProjectAsync(CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            var defaultUser = await _context.Users.FirstOrDefaultAsync(cancellationToken);
            if (defaultUser != null)
                currentUserId = defaultUser.Id;
            else
                return Result<ProjectDto>.Fail("No authenticated user found to assign as project owner.");
        }

        var keyUpper = request.Key.Trim().ToUpper();
        if (await _context.Projects.AnyAsync(p => p.Key == keyUpper, cancellationToken))
        {
            return Result<ProjectDto>.Fail($"Project key '{keyUpper}' is already in use.");
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Key = keyUpper,
            Description = request.Description?.Trim(),
            OwnerId = currentUserId.Value
        };

        // Create default board and columns
        var board = new Board
        {
            Name = "Sprint Board",
            Description = "Default Kanban board for " + project.Name,
            Project = project,
            OrderIndex = 0,
            Columns = new List<BoardColumn>
            {
                new() { Name = "Backlog", OrderIndex = 0, StatusMapping = TaskItemStatus.Backlog },
                new() { Name = "To Do", OrderIndex = 1, StatusMapping = TaskItemStatus.Todo },
                new() { Name = "In Progress", OrderIndex = 2, StatusMapping = TaskItemStatus.InProgress },
                new() { Name = "In Review", OrderIndex = 3, StatusMapping = TaskItemStatus.InReview },
                new() { Name = "Done", OrderIndex = 4, StatusMapping = TaskItemStatus.Done }
            }
        };

        project.Boards.Add(board);
        project.Members.Add(new ProjectMember
        {
            UserId = currentUserId.Value,
            Role = ProjectRole.Owner
        });

        await _context.Projects.AddAsync(project, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var owner = await _context.Users.FindAsync(new object[] { currentUserId.Value }, cancellationToken);

        return Result<ProjectDto>.Ok(new ProjectDto(
            project.Id,
            project.Name,
            project.Key,
            project.Description,
            project.OwnerId,
            owner?.FullName ?? "System",
            0,
            1,
            project.CreatedAt
        ));
    }

    public async Task<Result<ProjectDto>> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Tasks)
            .Include(p => p.Boards)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return Result<ProjectDto>.Fail("Project not found.");
        }

        project.Name = request.Name.Trim();
        project.Description = request.Description?.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProjectDto>.Ok(new ProjectDto(
            project.Id,
            project.Name,
            project.Key,
            project.Description,
            project.OwnerId,
            project.Owner != null ? project.Owner.FullName : "System",
            project.Tasks.Count,
            project.Boards.Count,
            project.CreatedAt
        ));
    }

    public async Task<Result> DeleteProjectAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects.FindAsync(new object[] { projectId }, cancellationToken);
        if (project == null)
        {
            return Result.Fail("Project not found.");
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
