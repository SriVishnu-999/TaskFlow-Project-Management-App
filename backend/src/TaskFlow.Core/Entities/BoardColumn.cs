using TaskFlow.Core.Common;
using TaskFlow.Core.Enums;

namespace TaskFlow.Core.Entities;

public class BoardColumn : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;

    public int OrderIndex { get; set; } = 0;
    public TaskItemStatus StatusMapping { get; set; } = TaskItemStatus.Todo;

    // Navigation properties
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
