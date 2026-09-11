using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.Api.Controllers;

public class BoardsController : BaseApiController
{
    private readonly IBoardService _boardService;

    public BoardsController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BoardDto>> GetBoardById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _boardService.GetBoardByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("project/{projectId:guid}/default")]
    public async Task<ActionResult<BoardDto>> GetProjectDefaultBoard(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _boardService.GetProjectDefaultBoardAsync(projectId, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<ActionResult<BoardDto>> CreateBoard([FromBody] CreateBoardRequest request, CancellationToken cancellationToken)
    {
        var result = await _boardService.CreateBoardAsync(request, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("{boardId:guid}/columns")]
    public async Task<ActionResult<BoardColumnDto>> AddColumn(Guid boardId, [FromBody] CreateColumnRequest request, CancellationToken cancellationToken)
    {
        var result = await _boardService.AddColumnAsync(boardId, request, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("columns/{columnId:guid}")]
    public async Task<ActionResult<BoardColumnDto>> UpdateColumn(Guid columnId, [FromBody] UpdateColumnRequest request, CancellationToken cancellationToken)
    {
        var result = await _boardService.UpdateColumnAsync(columnId, request, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("columns/{columnId:guid}")]
    public async Task<ActionResult> DeleteColumn(Guid columnId, CancellationToken cancellationToken)
    {
        var result = await _boardService.DeleteColumnAsync(columnId, cancellationToken);
        return HandleResult(result);
    }
}
