using TaskFlow.Application.Common;
using TaskFlow.Application.DTOs;

namespace TaskFlow.Application.Interfaces;

public interface IBoardService
{
    Task<Result<BoardDto>> GetBoardByIdAsync(Guid boardId, CancellationToken cancellationToken = default);
    Task<Result<BoardDto>> GetProjectDefaultBoardAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<Result<BoardDto>> CreateBoardAsync(CreateBoardRequest request, CancellationToken cancellationToken = default);
    Task<Result<BoardColumnDto>> AddColumnAsync(Guid boardId, CreateColumnRequest request, CancellationToken cancellationToken = default);
    Task<Result<BoardColumnDto>> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteColumnAsync(Guid columnId, CancellationToken cancellationToken = default);
}
