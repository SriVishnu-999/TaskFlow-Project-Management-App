using TaskFlow.Core.Common;
using TaskFlow.Core.Enums;

namespace TaskFlow.Core.Entities;

public class ProjectTask : BaseEntity
{
    public string TaskKey { get; set; } = string.Empty; // e.g. "TF-101"
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public int OrderIndex { get; set; } = 0;

    public Guid BoardColumnId { get; set; }
    public BoardColumn BoardColumn { get; set; } = null!;

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public DateTime? DueDate { get; set; }
    public int StoryPoints { get; set; } = 1;
    public string? TagsJson { get; set; } // Stored as JSON array: ["Frontend", "Bug"]

    // Navigation properties
    public ICollection<TaskActivity> Activities { get; set; } = new List<TaskActivity>();
}
