using TaskFlow.Core.Common;

namespace TaskFlow.Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty; // e.g., "TF"
    public string? Description { get; set; }

    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // Navigation properties
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<Board> Boards { get; set; } = new List<Board>();
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
