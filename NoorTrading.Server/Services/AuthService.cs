using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Repositories;

namespace NoorTrading.Server.Services;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest req);
    Task<AuthTokens> RefreshAsync(RefreshRequest req);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest req);
}

public class AuthService(IUnitOfWork uow, ITokenService tokens) : IAuthService
{
    private IRepository<AdminUser> Users => uow.Repository<AdminUser>();

    public async Task<AuthResult> LoginAsync(LoginRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !PasswordHasher.Verify(req.Password, user.PasswordHash))
            throw AppException.Unauthorized("Identifiants incorrects.");

        return await IssueTokensAsync(user);
    }

    public async Task<AuthTokens> RefreshAsync(RefreshRequest req)
    {
        var user = await Users.FirstOrDefaultAsync(u => u.RefreshToken == req.RefreshToken);
        if (user is null || user.RefreshTokenExpiresAtUtc is null
            || user.RefreshTokenExpiresAtUtc < DateTime.UtcNow)
            throw AppException.Unauthorized("Session expirée, reconnectez-vous.");

        var result = await IssueTokensAsync(user);
        return new AuthTokens(result.AccessToken, result.RefreshToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest req)
    {
        var user = await Users.FindAsync(userId)
            ?? throw AppException.NotFound("Utilisateur introuvable.");

        if (!PasswordHasher.Verify(req.CurrentPassword, user.PasswordHash))
            throw AppException.BadRequest("L'ancien mot de passe est incorrect.");

        user.PasswordHash = PasswordHasher.Hash(req.NewPassword);
        user.RefreshToken = null;   // invalide les sessions existantes
        Users.Update(user);
        await uow.SaveChangesAsync();
    }

    private async Task<AuthResult> IssueTokensAsync(AdminUser user)
    {
        var access = tokens.CreateAccessToken(user);
        var refresh = tokens.CreateRefreshToken();
        user.RefreshToken = refresh;
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(tokens.RefreshTokenDays);
        Users.Update(user);
        await uow.SaveChangesAsync();

        return new AuthResult(access, refresh,
            new AdminUserDto(user.Id, user.Email, user.FullName));
    }
}
