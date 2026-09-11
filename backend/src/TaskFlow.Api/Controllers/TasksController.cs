using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Enums;

namespace TaskFlow.Api.Controllers;

public class TasksController : BaseApiController
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDto>> GetTaskById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _taskService.GetTaskByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<IReadOnlyList<TaskDto>>> GetTasksByProject(
        Guid projectId,
        [FromQuery] string? search,
        [FromQuery] TaskPriority? priority,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] Guid? assigneeId,
        CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetTasksByProjectAsync(projectId, search, priority, status, assigneeId, cancellationToken);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var result = await _taskService.CreateTaskAsync(request, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var result = await _taskService.UpdateTaskAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/move")]
    public async Task<ActionResult<TaskDto>> MoveTask(Guid id, [FromBody] MoveTaskRequest request, CancellationToken cancellationToken)
    {
        var result = await _taskService.MoveTaskAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTask(Guid id, CancellationToken cancellationToken)
    {
        var result = await _taskService.DeleteTaskAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}/activities")]
    public async Task<ActionResult<IReadOnlyList<TaskActivityDto>>> GetTaskActivities(Guid id, CancellationToken cancellationToken)
    {
        var activities = await _taskService.GetTaskActivitiesAsync(id, cancellationToken);
        return Ok(activities);
    }
}
