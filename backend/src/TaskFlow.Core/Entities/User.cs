using TaskFlow.Core.Common;

namespace TaskFlow.Core.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Developer";
    public string? AvatarUrl { get; set; }

    // Navigation properties
    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();
    public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
    public ICollection<ProjectTask> ReportedTasks { get; set; } = new List<ProjectTask>();
    public ICollection<TaskActivity> Activities { get; set; } = new List<TaskActivity>();
}
