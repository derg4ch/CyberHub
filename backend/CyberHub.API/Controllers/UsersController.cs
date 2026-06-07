using CyberHub.BLL.DTOs.Auth;
using CyberHub.DAL.UnitOfWork;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

[ApiController, Route("api/users"), Authorize(Roles = "admin")]
[Produces("application/json"), Tags("Users (Admin)")]
public class UsersController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await uow.Users.GetAllAsync();
        return Ok(users.Select(u => new UserDto(
            u.Id, u.Email, u.Username, u.FullName, u.PhoneNumber,
            u.AvatarUrl, u.Role, u.XpPoints, u.Level, u.TotalSessions, u.TotalHours)));
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> SetRole(Guid id, [FromBody] SetRoleRequest req)
    {
        var user = await uow.Users.GetByIdAsync(id);
        if (user is null) return NotFound();
        user.Role = req.Role;
        await uow.Users.UpdateAsync(user);
        await uow.SaveChangesAsync();
        return NoContent();
    }
}

public record SetRoleRequest(string Role);
