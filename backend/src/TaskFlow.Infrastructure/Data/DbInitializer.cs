using TaskFlow.Core.Entities;
using TaskFlow.Core.Enums;
using TaskFlow.Infrastructure.Services;

namespace TaskFlow.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(TaskFlowDbContext context, IPasswordHasher passwordHasher)
    {
        // Ensure database created
        await context.Database.EnsureCreatedAsync();

        if (context.Users.Any())
        {
            return; // DB already seeded
        }

        // 1. Seed Users
        var demoUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Alex Morgan",
            Email = "demo@taskflow.dev",
            PasswordHash = passwordHasher.HashPassword("Demo@123"),
            Role = "Engineering Lead",
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };

        var userSarah = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Sarah Chen",
            Email = "sarah.chen@taskflow.dev",
            PasswordHash = passwordHasher.HashPassword("Demo@123"),
            Role = "Senior Backend Engineer",
            AvatarUrl = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
        };

        var userMarcus = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Marcus Vance",
            Email = "marcus.vance@taskflow.dev",
            PasswordHash = passwordHasher.HashPassword("Demo@123"),
            Role = "Lead Frontend Engineer",
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        };

        var userElena = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Elena Rostova",
            Email = "elena.rostova@taskflow.dev",
            PasswordHash = passwordHasher.HashPassword("Demo@123"),
            Role = "Product Designer",
            AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
        };

        await context.Users.AddRangeAsync(demoUser, userSarah, userMarcus, userElena);

        // 2. Seed Project
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "TaskFlow Core Platform",
            Key = "TF",
            Description = "Next-generation distributed workflow and agile project management engine.",
            OwnerId = demoUser.Id
        };

        project.Members.Add(new ProjectMember { ProjectId = project.Id, UserId = demoUser.Id, Role = ProjectRole.Owner });
        project.Members.Add(new ProjectMember { ProjectId = project.Id, UserId = userSarah.Id, Role = ProjectRole.Admin });
        project.Members.Add(new ProjectMember { ProjectId = project.Id, UserId = userMarcus.Id, Role = ProjectRole.Member });
        project.Members.Add(new ProjectMember { ProjectId = project.Id, UserId = userElena.Id, Role = ProjectRole.Member });

        // 3. Seed Board and Columns
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Sprint 14 - Production Readiness",
            Description = "Main agile delivery board for Q3 release",
            ProjectId = project.Id,
            OrderIndex = 0
        };

        var colBacklog = new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "Backlog", OrderIndex = 0, StatusMapping = TaskItemStatus.Backlog };
        var colTodo = new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "To Do", OrderIndex = 1, StatusMapping = TaskItemStatus.Todo };
        var colInProgress = new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "In Progress", OrderIndex = 2, StatusMapping = TaskItemStatus.InProgress };
        var colInReview = new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "In Review", OrderIndex = 3, StatusMapping = TaskItemStatus.InReview };
        var colDone = new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "Done", OrderIndex = 4, StatusMapping = TaskItemStatus.Done };

        board.Columns.Add(colBacklog);
        board.Columns.Add(colTodo);
        board.Columns.Add(colInProgress);
        board.Columns.Add(colInReview);
        board.Columns.Add(colDone);

        project.Boards.Add(board);
        await context.Projects.AddAsync(project);

        // 4. Seed Tasks with realistic technical items
        var tasks = new List<ProjectTask>
        {
            // Backlog
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-101",
                Title = "Implement OAuth2 SSO with Google and Microsoft",
                Description = "Extend authentication layer to support OpenID Connect and Enterprise SSO providers.",
                Priority = TaskPriority.Medium,
                Status = TaskItemStatus.Backlog,
                OrderIndex = 0,
                BoardColumnId = colBacklog.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userSarah.Id,
                DueDate = DateTime.UtcNow.AddDays(14),
                StoryPoints = 5,
                TagsJson = "[\"Security\", \"Auth\", \"Backend\"]"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-102",
                Title = "Support Webhooks for external automation events",
                Description = "Publish signed HMAC webhooks on task movement, creation, and member assignments.",
                Priority = TaskPriority.Low,
                Status = TaskItemStatus.Backlog,
                OrderIndex = 1,
                BoardColumnId = colBacklog.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userSarah.Id,
                DueDate = DateTime.UtcNow.AddDays(20),
                StoryPoints = 3,
                TagsJson = "[\"Integrations\", \"API\"]"
            },

            // To Do
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-103",
                Title = "Design dark mode palette and system theme toggle",
                Description = "Ensure WCAG AAA contrast ratio across all Kanban board columns and task modals.",
                Priority = TaskPriority.Medium,
                Status = TaskItemStatus.Todo,
                OrderIndex = 0,
                BoardColumnId = colTodo.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userElena.Id,
                DueDate = DateTime.UtcNow.AddDays(5),
                StoryPoints = 3,
                TagsJson = "[\"UI/UX\", \"Design System\"]"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-104",
                Title = "Write comprehensive unit tests for TaskService state transitions",
                Description = "Cover column moving, optimistic UI validation, and boundary conditions using xUnit.",
                Priority = TaskPriority.High,
                Status = TaskItemStatus.Todo,
                OrderIndex = 1,
                BoardColumnId = colTodo.Id,
                ProjectId = project.Id,
                ReporterId = userSarah.Id,
                AssigneeId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(3),
                StoryPoints = 4,
                TagsJson = "[\"Testing\", \"QA\", \"Quality\"]"
            },

            // In Progress
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-105",
                Title = "Optimize EF Core queries with AsNoTracking and projection",
                Description = "Reduce memory footprint on high-concurrency board queries by utilizing selective projections.",
                Priority = TaskPriority.High,
                Status = TaskItemStatus.InProgress,
                OrderIndex = 0,
                BoardColumnId = colInProgress.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userSarah.Id,
                DueDate = DateTime.UtcNow.AddDays(2),
                StoryPoints = 5,
                TagsJson = "[\"Performance\", \"Database\", \"EFCore\"]"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-106",
                Title = "Interactive Drag-and-Drop Kanban columns with visual drop indicator",
                Description = "Enable fluid multi-column dragging with ghosting feedback and smooth keyboard accessibility.",
                Priority = TaskPriority.Urgent,
                Status = TaskItemStatus.InProgress,
                OrderIndex = 1,
                BoardColumnId = colInProgress.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userMarcus.Id,
                DueDate = DateTime.UtcNow.AddDays(1),
                StoryPoints = 8,
                TagsJson = "[\"Frontend\", \"React\", \"DragDrop\"]"
            },

            // In Review
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-107",
                Title = "JWT Refresh Token rotation and HTTP-Only Cookie strategy",
                Description = "Implemented token rotation with revocation blacklist on suspicious client fingerprint changes.",
                Priority = TaskPriority.High,
                Status = TaskItemStatus.InReview,
                OrderIndex = 0,
                BoardColumnId = colInReview.Id,
                ProjectId = project.Id,
                ReporterId = userSarah.Id,
                AssigneeId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(1),
                StoryPoints = 5,
                TagsJson = "[\"Security\", \"Auth\"]"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-108",
                Title = "Real-time task velocity and completion analytics dashboard",
                Description = "Calculates sprint burndown, priority distribution, and team throughput metrics.",
                Priority = TaskPriority.Medium,
                Status = TaskItemStatus.InReview,
                OrderIndex = 1,
                BoardColumnId = colInReview.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userMarcus.Id,
                DueDate = DateTime.UtcNow.AddDays(2),
                StoryPoints = 5,
                TagsJson = "[\"Analytics\", \"Charts\"]"
            },

            // Done
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-109",
                Title = "Setup ASP.NET Core 9 Clean Architecture solution foundation",
                Description = "Separated Core, Infrastructure, Application, and API with SOLID architectural patterns.",
                Priority = TaskPriority.Urgent,
                Status = TaskItemStatus.Done,
                OrderIndex = 0,
                BoardColumnId = colDone.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(-2),
                StoryPoints = 8,
                TagsJson = "[\"Architecture\", \".NET9\", \"Core\"]"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-110",
                Title = "Database schema design and entity relational mapping",
                Description = "Configured relational cascade rules, indexes on unique keys, and automatic audit timestamps.",
                Priority = TaskPriority.High,
                Status = TaskItemStatus.Done,
                OrderIndex = 1,
                BoardColumnId = colDone.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = userSarah.Id,
                DueDate = DateTime.UtcNow.AddDays(-1),
                StoryPoints = 5,
                TagsJson = "[\"Database\", \"SQLServer\"]"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TaskKey = "TF-111",
                Title = "Global exception handling middleware and RFC 7807 problem details",
                Description = "Intercept unhandled exceptions and serialize standardized JSON error payloads.",
                Priority = TaskPriority.Medium,
                Status = TaskItemStatus.Done,
                OrderIndex = 2,
                BoardColumnId = colDone.Id,
                ProjectId = project.Id,
                ReporterId = demoUser.Id,
                AssigneeId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(-1),
                StoryPoints = 3,
                TagsJson = "[\"Middleware\", \"ErrorHandling\"]"
            }
        };

        foreach (var task in tasks)
        {
            task.Activities.Add(new TaskActivity
            {
                Id = Guid.NewGuid(),
                TaskId = task.Id,
                UserId = task.ReporterId,
                Action = "Created",
                Description = $"Created task {task.TaskKey}: {task.Title}",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            });

            if (task.Status == TaskItemStatus.Done)
            {
                task.Activities.Add(new TaskActivity
                {
                    Id = Guid.NewGuid(),
                    TaskId = task.Id,
                    UserId = task.AssigneeId ?? demoUser.Id,
                    Action = "Completed",
                    Description = $"Completed task and moved to Done column",
                    CreatedAt = DateTime.UtcNow.AddHours(-6)
                });
            }
        }

        await context.Tasks.AddRangeAsync(tasks);
        await context.SaveChangesAsync();
    }
}
