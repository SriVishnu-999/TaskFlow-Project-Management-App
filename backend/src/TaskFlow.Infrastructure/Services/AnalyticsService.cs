using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Enums;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly TaskFlowDbContext _context;

    public AnalyticsService(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProjectAnalyticsDto>> GetProjectAnalyticsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects.FindAsync(new object[] { projectId }, cancellationToken);
        if (project == null)
        {
            return Result<ProjectAnalyticsDto>.Fail("Project not found.");
        }

        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var activities = await _context.TaskActivities
            .Include(a => a.User)
            .Include(a => a.Task)
            .Where(a => a.Task.ProjectId == projectId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<ProjectAnalyticsDto>.Ok(BuildAnalytics(project.Id, project.Name, tasks, activities));
    }

    public async Task<Result<ProjectAnalyticsDto>> GetGlobalAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await _context.Tasks.AsNoTracking().ToListAsync(cancellationToken);
        var activities = await _context.TaskActivities
            .Include(a => a.User)
            .Include(a => a.Task)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<ProjectAnalyticsDto>.Ok(BuildAnalytics(Guid.Empty, "All Projects", tasks, activities));
    }

    private static ProjectAnalyticsDto BuildAnalytics(
        Guid projectId, 
        string projectName, 
        List<Core.Entities.ProjectTask> tasks, 
        List<Core.Entities.TaskActivity> activities)
    {
        var now = DateTime.UtcNow;
        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == TaskItemStatus.Done);
        var inProgressTasks = tasks.Count(t => t.Status == TaskItemStatus.InProgress);
        var overdueTasks = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < now && t.Status != TaskItemStatus.Done);
        var completionPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

        var totalStoryPoints = tasks.Sum(t => t.StoryPoints);
        var completedStoryPoints = tasks.Where(t => t.Status == TaskItemStatus.Done).Sum(t => t.StoryPoints);

        var priorityBreakdown = new List<PriorityDistributionDto>
        {
            new("Urgent", tasks.Count(t => t.Priority == TaskPriority.Urgent), "#ef4444"),
            new("High", tasks.Count(t => t.Priority == TaskPriority.High), "#f97316"),
            new("Medium", tasks.Count(t => t.Priority == TaskPriority.Medium), "#3b82f6"),
            new("Low", tasks.Count(t => t.Priority == TaskPriority.Low), "#10b981")
        };

        var statusBreakdown = new List<StatusDistributionDto>
        {
            new("Backlog", tasks.Count(t => t.Status == TaskItemStatus.Backlog)),
            new("To Do", tasks.Count(t => t.Status == TaskItemStatus.Todo)),
            new("In Progress", tasks.Count(t => t.Status == TaskItemStatus.InProgress)),
            new("In Review", tasks.Count(t => t.Status == TaskItemStatus.InReview)),
            new("Done", tasks.Count(t => t.Status == TaskItemStatus.Done))
        };

        var recentActivities = activities.Select(a => new RecentActivityDto(
            a.Id,
            a.Task != null ? a.Task.TaskKey : "Task",
            a.Task != null ? a.Task.Title : "",
            a.User != null ? a.User.FullName : "System",
            a.Action,
            a.Description,
            a.CreatedAt
        )).ToList();

        return new ProjectAnalyticsDto(
            projectId,
            projectName,
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            completionPercentage,
            totalStoryPoints,
            completedStoryPoints,
            priorityBreakdown,
            statusBreakdown,
            recentActivities
        );
    }
}
