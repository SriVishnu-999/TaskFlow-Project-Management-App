namespace TaskFlow.Application.DTOs;

public record ProjectAnalyticsDto(
    Guid ProjectId,
    string ProjectName,
    int TotalTasks,
    int CompletedTasks,
    int InProgressTasks,
    int OverdueTasks,
    double CompletionPercentage,
    int TotalStoryPoints,
    int CompletedStoryPoints,
    List<PriorityDistributionDto> PriorityBreakdown,
    List<StatusDistributionDto> StatusBreakdown,
    List<RecentActivityDto> RecentActivities
);

public record PriorityDistributionDto(
    string Priority,
    int Count,
    string Color
);

public record StatusDistributionDto(
    string Status,
    int Count
);

public record RecentActivityDto(
    Guid Id,
    string TaskKey,
    string TaskTitle,
    string UserName,
    string Action,
    string Description,
    DateTime Timestamp
);
