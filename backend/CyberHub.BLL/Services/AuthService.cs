using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CyberHub.BLL.DTOs.Auth;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.UnitOfWork;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CyberHub.BLL.Services;

public class AuthService(IUnitOfWork uow, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await uow.Users.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponse(GenerateToken(user), MapUser(user));
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await uow.Users.GetByEmailAsync(request.Email);
        if (existing is not null)
            throw new InvalidOperationException("Email is already taken.");

        var user = new AppUser
        {
            Email        = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Username     = request.Username,
            FullName     = request.FullName,
            PhoneNumber  = request.PhoneNumber,
            Role         = "user",
        };

        await uow.Users.CreateAsync(user);
        return new AuthResponse(GenerateToken(user), MapUser(user));
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        var user = await uow.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");
        return MapUser(user);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await uow.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (request.Username  is not null) user.Username    = request.Username;
        if (request.FullName  is not null) user.FullName    = request.FullName;
        if (request.PhoneNumber is not null) user.PhoneNumber = request.PhoneNumber;
        if (request.AvatarUrl is not null) user.AvatarUrl   = request.AvatarUrl;

        await uow.Users.UpdateAsync(user);
        return MapUser(user);
    }

    private string GenerateToken(AppUser user)
    {
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddDays(double.Parse(config["Jwt:ExpiresInDays"]!));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role,               user.Role),
            new Claim("username",                    user.Username ?? ""),
        };

        var token = new JwtSecurityToken(
            issuer:             config["Jwt:Issuer"],
            audience:           config["Jwt:Audience"],
            claims:             claims,
            expires:            expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapUser(AppUser u) => new(
        u.Id, u.Email, u.Username, u.FullName, u.PhoneNumber,
        u.AvatarUrl, u.Role, u.XpPoints, u.Level, u.TotalSessions, u.TotalHours);
}
