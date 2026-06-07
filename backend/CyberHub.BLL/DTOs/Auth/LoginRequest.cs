using System.ComponentModel.DataAnnotations;

namespace CyberHub.BLL.DTOs.Auth;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);
