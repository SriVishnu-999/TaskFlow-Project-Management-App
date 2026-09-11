using TaskFlow.Core.Common;

namespace TaskFlow.Core.Entities;

public class TaskActivity : BaseEntity
{
    public Guid TaskId { get; set; }
    public ProjectTask Task { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Action { get; set; } = string.Empty; // "Created", "Moved", "Updated", "Commented"
    public string Description { get; set; } = string.Empty;
}
