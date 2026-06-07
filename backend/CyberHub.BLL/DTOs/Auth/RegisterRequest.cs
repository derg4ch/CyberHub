using System.ComponentModel.DataAnnotations;

namespace CyberHub.BLL.DTOs.Auth;

public record RegisterRequest(
    [Required, EmailAddress]      string  Email,
    [Required, MinLength(6)]      string  Password,
    [Required, MinLength(2)]      string  Username,
    string?                               FullName,
    string?                               PhoneNumber
);
