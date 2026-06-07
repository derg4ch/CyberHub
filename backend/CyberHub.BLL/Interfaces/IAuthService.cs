using CyberHub.BLL.DTOs.Auth;

namespace CyberHub.BLL.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<UserDto>      GetMeAsync(Guid userId);
    Task<UserDto>      UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
}
