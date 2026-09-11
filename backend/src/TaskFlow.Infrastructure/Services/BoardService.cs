using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Entities;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Services;

public class BoardService : IBoardService
{
    private readonly TaskFlowDbContext _context;

    public BoardService(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BoardDto>> GetBoardByIdAsync(Guid boardId, CancellationToken cancellationToken = default)
    {
        var board = await _context.Boards
            .Include(b => b.Columns.OrderBy(c => c.OrderIndex))
                .ThenInclude(c => c.Tasks.OrderBy(t => t.OrderIndex))
                    .ThenInclude(t => t.Assignee)
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
                    .ThenInclude(t => t.Reporter)
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == boardId, cancellationToken);

        if (board == null)
        {
            return Result<BoardDto>.Fail("Board not found.");
        }

        return Result<BoardDto>.Ok(MapToDto(board));
    }

    public async Task<Result<BoardDto>> GetProjectDefaultBoardAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var board = await _context.Boards
            .Include(b => b.Columns.OrderBy(c => c.OrderIndex))
                .ThenInclude(c => c.Tasks.OrderBy(t => t.OrderIndex))
                    .ThenInclude(t => t.Assignee)
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
                    .ThenInclude(t => t.Reporter)
            .AsNoTracking()
            .OrderBy(b => b.OrderIndex)
            .FirstOrDefaultAsync(b => b.ProjectId == projectId, cancellationToken);

        if (board == null)
        {
            return Result<BoardDto>.Fail("No board found for this project.");
        }

        return Result<BoardDto>.Ok(MapToDto(board));
    }

    public async Task<Result<BoardDto>> CreateBoardAsync(CreateBoardRequest request, CancellationToken cancellationToken = default)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (!projectExists)
        {
            return Result<BoardDto>.Fail("Project not found.");
        }

        var maxOrder = await _context.Boards
            .Where(b => b.ProjectId == request.ProjectId)
            .Select(b => (int?)b.OrderIndex)
            .MaxAsync(cancellationToken) ?? -1;

        var board = new Board
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            ProjectId = request.ProjectId,
            OrderIndex = maxOrder + 1,
            Columns = new List<BoardColumn>
            {
                new() { Name = "Backlog", OrderIndex = 0, StatusMapping = Core.Enums.TaskItemStatus.Backlog },
                new() { Name = "To Do", OrderIndex = 1, StatusMapping = Core.Enums.TaskItemStatus.Todo },
                new() { Name = "In Progress", OrderIndex = 2, StatusMapping = Core.Enums.TaskItemStatus.InProgress },
                new() { Name = "In Review", OrderIndex = 3, StatusMapping = Core.Enums.TaskItemStatus.InReview },
                new() { Name = "Done", OrderIndex = 4, StatusMapping = Core.Enums.TaskItemStatus.Done }
            }
        };

        await _context.Boards.AddAsync(board, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetBoardByIdAsync(board.Id, cancellationToken);
    }

    public async Task<Result<BoardColumnDto>> AddColumnAsync(Guid boardId, CreateColumnRequest request, CancellationToken cancellationToken = default)
    {
        var board = await _context.Boards.FindAsync(new object[] { boardId }, cancellationToken);
        if (board == null)
        {
            return Result<BoardColumnDto>.Fail("Board not found.");
        }

        var maxOrder = await _context.BoardColumns
            .Where(c => c.BoardId == boardId)
            .Select(c => (int?)c.OrderIndex)
            .MaxAsync(cancellationToken) ?? -1;

        var column = new BoardColumn
        {
            BoardId = boardId,
            Name = request.Name.Trim(),
            OrderIndex = maxOrder + 1,
            StatusMapping = request.StatusMapping
        };

        await _context.BoardColumns.AddAsync(column, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<BoardColumnDto>.Ok(new BoardColumnDto(
            column.Id,
            column.BoardId,
            column.Name,
            column.OrderIndex,
            column.StatusMapping,
            new List<TaskDto>()
        ));
    }

    public async Task<Result<BoardColumnDto>> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, CancellationToken cancellationToken = default)
    {
        var column = await _context.BoardColumns
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == columnId, cancellationToken);

        if (column == null)
        {
            return Result<BoardColumnDto>.Fail("Column not found.");
        }

        column.Name = request.Name.Trim();
        column.OrderIndex = request.OrderIndex;
        column.StatusMapping = request.StatusMapping;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<BoardColumnDto>.Ok(new BoardColumnDto(
            column.Id,
            column.BoardId,
            column.Name,
            column.OrderIndex,
            column.StatusMapping,
            new List<TaskDto>()
        ));
    }

    public async Task<Result> DeleteColumnAsync(Guid columnId, CancellationToken cancellationToken = default)
    {
        var column = await _context.BoardColumns
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == columnId, cancellationToken);

        if (column == null)
        {
            return Result.Fail("Column not found.");
        }

        if (column.Tasks.Any())
        {
            return Result.Fail("Cannot delete column with existing tasks. Move or delete tasks first.");
        }

        _context.BoardColumns.Remove(column);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }

    private static BoardDto MapToDto(Board board)
    {
        var columns = board.Columns
            .OrderBy(c => c.OrderIndex)
            .Select(c => new BoardColumnDto(
                c.Id,
                c.BoardId,
                c.Name,
                c.OrderIndex,
                c.StatusMapping,
                c.Tasks
                    .OrderBy(t => t.OrderIndex)
                    .Select(t => new TaskDto(
                        t.Id,
                        t.TaskKey,
                        t.Title,
                        t.Description,
                        t.Priority,
                        t.Status,
                        t.OrderIndex,
                        t.BoardColumnId,
                        t.ProjectId,
                        t.ReporterId,
                        t.Reporter != null ? t.Reporter.FullName : "Unknown",
                        t.AssigneeId,
                        t.Assignee != null ? t.Assignee.FullName : null,
                        t.DueDate,
                        t.StoryPoints,
                        ParseTags(t.TagsJson),
                        t.CreatedAt,
                        t.UpdatedAt
                    )).ToList()
            )).ToList();

        return new BoardDto(board.Id, board.ProjectId, board.Name, board.Description, board.OrderIndex, columns);
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
