using System.ComponentModel.DataAnnotations;

namespace NoorTrading.Server.Dtos;

public class LoginRequest
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class RefreshRequest
{
    [Required] public string RefreshToken { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required] public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8, ErrorMessage = "Le mot de passe doit faire au moins 8 caractères.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required, Compare(nameof(NewPassword), ErrorMessage = "La confirmation ne correspond pas.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public record AuthTokens(string AccessToken, string RefreshToken);
public record AuthResult(string AccessToken, string RefreshToken, AdminUserDto User);
public record AdminUserDto(Guid Id, string Email, string FullName);
