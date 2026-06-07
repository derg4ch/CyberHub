using CyberHub.DAL.Context;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Repositories.Implementations;

public class UserRepository(AppDbContext db) : BaseRepository<AppUser>(db), IUserRepository
{
    public Task<AppUser?> GetByEmailAsync(string email) =>
        Set.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());
}
