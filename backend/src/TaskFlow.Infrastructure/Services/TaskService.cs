using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Entities;
using TaskFlow.Core.Enums;
using TaskFlow.Core.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly TaskFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public TaskService(TaskFlowDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<TaskDto>> GetTaskByIdAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks
            .Include(t => t.Reporter)
            .Include(t => t.Assignee)
            .Include(t => t.BoardColumn)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

        if (task == null)
        {
            return Result<TaskDto>.Fail("Task not found.");
        }

        return Result<TaskDto>.Ok(MapToDto(task));
    }

    public async Task<IReadOnlyList<TaskDto>> GetTasksByProjectAsync(
        Guid projectId,
        string? search = null,
        TaskPriority? priority = null,
        TaskItemStatus? status = null,
        Guid? assigneeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Tasks
            .Include(t => t.Reporter)
            .Include(t => t.Assignee)
            .Where(t => t.ProjectId == projectId)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(s) || 
                                    t.TaskKey.ToLower().Contains(s) || 
                                    (t.Description != null && t.Description.ToLower().Contains(s)));
        }

        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (assigneeId.HasValue)
        {
            query = query.Where(t => t.AssigneeId == assigneeId.Value);
        }

        var tasks = await query.OrderBy(t => t.OrderIndex).ToListAsync(cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<Result<TaskDto>> CreateTaskAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects.FindAsync(new object[] { request.ProjectId }, cancellationToken);
        if (project == null)
        {
            return Result<TaskDto>.Fail("Project not found.");
        }

        var column = await _context.BoardColumns.FindAsync(new object[] { request.BoardColumnId }, cancellationToken);
        if (column == null)
        {
            return Result<TaskDto>.Fail("Board column not found.");
        }

        var reporterId = _currentUserService.UserId;
        if (!reporterId.HasValue)
        {
            var defaultUser = await _context.Users.FirstOrDefaultAsync(cancellationToken);
            reporterId = defaultUser?.Id ?? Guid.NewGuid();
        }

        // Auto-generate key: TF-101, etc.
        var taskCount = await _context.Tasks.CountAsync(t => t.ProjectId == request.ProjectId, cancellationToken);
        var taskKey = $"{project.Key}-{taskCount + 101}";

        var maxOrder = await _context.Tasks
            .Where(t => t.BoardColumnId == request.BoardColumnId)
            .Select(t => (int?)t.OrderIndex)
            .MaxAsync(cancellationToken) ?? -1;

        var task = new ProjectTask
        {
            TaskKey = taskKey,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Priority = request.Priority,
            Status = request.Status,
            OrderIndex = maxOrder + 1,
            BoardColumnId = request.BoardColumnId,
            ProjectId = request.ProjectId,
            ReporterId = reporterId.Value,
            AssigneeId = request.AssigneeId,
            DueDate = request.DueDate,
            StoryPoints = request.StoryPoints,
            TagsJson = request.Tags != null ? JsonSerializer.Serialize(request.Tags) : "[]"
        };

        task.Activities.Add(new TaskActivity
        {
            UserId = reporterId.Value,
            Action = "Created",
            Description = $"Created task {taskKey}"
        });

        await _context.Tasks.AddAsync(task, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetTaskByIdAsync(task.Id, cancellationToken);
    }

    public async Task<Result<TaskDto>> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks
            .Include(t => t.Activities)
            .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

        if (task == null)
        {
            return Result<TaskDto>.Fail("Task not found.");
        }

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim();
        task.Priority = request.Priority;
        task.Status = request.Status;
        task.BoardColumnId = request.BoardColumnId;
        task.AssigneeId = request.AssigneeId;
        task.DueDate = request.DueDate;
        task.StoryPoints = request.StoryPoints;
        task.TagsJson = request.Tags != null ? JsonSerializer.Serialize(request.Tags) : "[]";

        var currentUserId = _currentUserService.UserId ?? task.ReporterId;
        task.Activities.Add(new TaskActivity
        {
            UserId = currentUserId,
            Action = "Updated",
            Description = $"Updated task details"
        });

        await _context.SaveChangesAsync(cancellationToken);

        return await GetTaskByIdAsync(task.Id, cancellationToken);
    }

    public async Task<Result<TaskDto>> MoveTaskAsync(Guid taskId, MoveTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);
        if (task == null)
        {
            return Result<TaskDto>.Fail("Task not found.");
        }

        var oldColumnId = task.BoardColumnId;
        task.BoardColumnId = request.TargetColumnId;
        task.OrderIndex = request.NewOrderIndex;
        task.Status = request.NewStatus;

        var currentUserId = _currentUserService.UserId ?? task.ReporterId;
        task.Activities.Add(new TaskActivity
        {
            UserId = currentUserId,
            Action = "Moved",
            Description = $"Moved task to new status: {request.NewStatus}"
        });

        await _context.SaveChangesAsync(cancellationToken);

        return await GetTaskByIdAsync(task.Id, cancellationToken);
    }

    public async Task<Result> DeleteTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks.FindAsync(new object[] { taskId }, cancellationToken);
        if (task == null)
        {
            return Result.Fail("Task not found.");
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }

    public async Task<IReadOnlyList<TaskActivityDto>> GetTaskActivitiesAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var activities = await _context.TaskActivities
            .Include(a => a.User)
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return activities.Select(a => new TaskActivityDto(
            a.Id,
            a.TaskId,
            a.UserId,
            a.User != null ? a.User.FullName : "System",
            a.Action,
            a.Description,
            a.CreatedAt
        )).ToList();
    }

    private static TaskDto MapToDto(ProjectTask task)
    {
        return new TaskDto(
            task.Id,
            task.TaskKey,
            task.Title,
            task.Description,
            task.Priority,
            task.Status,
            task.OrderIndex,
            task.BoardColumnId,
            task.ProjectId,
            task.ReporterId,
            task.Reporter != null ? task.Reporter.FullName : "Unknown",
            task.AssigneeId,
            task.Assignee != null ? task.Assignee.FullName : null,
            task.DueDate,
            task.StoryPoints,
            ParseTags(task.TagsJson),
            task.CreatedAt,
            task.UpdatedAt
        );
    }

    private static List<string> ParseTags(string? tagsJson)
    {
        if (string.IsNullOrWhiteSpace(tagsJson)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(tagsJson) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}
