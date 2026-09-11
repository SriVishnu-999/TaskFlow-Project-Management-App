using TaskFlow.Core.Common;

namespace TaskFlow.Core.Entities;

public class Board : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public int OrderIndex { get; set; } = 0;

    // Navigation properties
    public ICollection<BoardColumn> Columns { get; set; } = new List<BoardColumn>();
}
