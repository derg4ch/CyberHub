namespace CyberHub.BLL.DTOs.Auth;

public record AuthResponse(
    string Token,
    UserDto User
);

public record UserDto(
    Guid    Id,
    string  Email,
    string? Username,
    string? FullName,
    string? PhoneNumber,
    string? AvatarUrl,
    string  Role,
    int     XpPoints,
    int     Level,
    int     TotalSessions,
    int     TotalHours
);
