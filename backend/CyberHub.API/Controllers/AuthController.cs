using System.Security.Claims;
using CyberHub.BLL.DTOs.Auth;
using CyberHub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var result = await auth.LoginAsync(req);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        var result = await auth.RegisterAsync(req);
        return CreatedAtAction(nameof(Me), result);
    }

    [HttpGet("me"), Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        return Ok(await auth.GetMeAsync(userId));
    }

    [HttpPatch("me"), Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        return Ok(await auth.UpdateProfileAsync(userId, req));
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
    }
}
