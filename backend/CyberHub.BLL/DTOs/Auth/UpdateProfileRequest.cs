namespace CyberHub.BLL.DTOs.Auth;

public record UpdateProfileRequest(
    string? Username,
    string? FullName,
    string? PhoneNumber,
    string? AvatarUrl
);
