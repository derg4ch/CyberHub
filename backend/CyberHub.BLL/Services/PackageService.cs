using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.BLL.Services;

public class PackageService(IPackageRepository repo) : IPackageService
{
    public async Task<IEnumerable<PackageDto>> GetAllAsync(bool? active = null)
    {
        var pkgs = active.HasValue
            ? active.Value ? await repo.GetActiveAsync() : await repo.GetAllAsync()
            : await repo.GetAllAsync();
        return pkgs.Select(ToDto);
    }

    public async Task<PackageDto?> GetByIdAsync(Guid id)
    {
        var p = await repo.GetByIdAsync(id);
        return p is null ? null : ToDto(p);
    }

    public async Task<PackageDto> CreateAsync(CreatePackageRequest r)
    {
        var pkg = new Package
        {
            Id              = Guid.NewGuid(),
            Category        = r.Category,
            Name            = r.Name,
            Description     = r.Description,
            Price           = r.Price,
            DurationMinutes = r.DurationMinutes,
            XpReward        = r.XpReward,
            IsActive        = r.IsActive,
            CreatedAt       = DateTime.UtcNow,
        };
        await repo.CreateAsync(pkg);
        return ToDto(pkg);
    }

    public async Task<PackageDto> UpdateAsync(UpdatePackageRequest r)
    {
        var pkg = await repo.GetByIdAsync(r.Id)
            ?? throw new KeyNotFoundException($"Package {r.Id} not found");

        pkg.Category        = r.Category;
        pkg.Name            = r.Name;
        pkg.Description     = r.Description;
        pkg.Price           = r.Price;
        pkg.DurationMinutes = r.DurationMinutes;
        pkg.XpReward        = r.XpReward;
        pkg.IsActive        = r.IsActive;

        await repo.UpdateAsync(pkg);
        return ToDto(pkg);
    }

    public Task DeleteAsync(Guid id) => repo.DeleteAsync(id);

    private static PackageDto ToDto(Package p) => new(
        p.Id, p.Category, p.Name, p.Description,
        p.Price, p.DurationMinutes, p.XpReward, p.IsActive, p.CreatedAt
    );
}
