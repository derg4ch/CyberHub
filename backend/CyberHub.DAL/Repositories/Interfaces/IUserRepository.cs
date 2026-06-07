using CyberHub.DAL.Models;

namespace CyberHub.DAL.Repositories.Interfaces;

public interface IUserRepository : IRepository<AppUser>
{
    Task<AppUser?> GetByEmailAsync(string email);
}
