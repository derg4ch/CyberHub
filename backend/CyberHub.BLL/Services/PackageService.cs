using CyberHub.BLL.DTOs;
using CyberHub.BLL.Exceptions;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.UnitOfWork;
using Mapster;

namespace CyberHub.BLL.Services;

public class PackageService(IUnitOfWork uow) : IPackageService
{
    public async Task<IEnumerable<PackageDto>> GetAllAsync(bool? active = null)
    {
        var pkgs = active switch
        {
            true => await uow.Packages.GetActiveAsync(),
            _    => await uow.Packages.GetAllAsync(),
        };
        return pkgs.Adapt<IEnumerable<PackageDto>>();
    }

    public async Task<PackageDto?> GetByIdAsync(Guid id)
    {
        var pkg = await uow.Packages.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Package), id);
        return pkg.Adapt<PackageDto>();
    }

    public async Task<PackageDto> CreateAsync(CreatePackageRequest request)
    {
        var pkg = request.Adapt<Package>();
        await uow.Packages.CreateAsync(pkg);
        await uow.SaveChangesAsync();
        return pkg.Adapt<PackageDto>();
    }

    public async Task<PackageDto> UpdateAsync(UpdatePackageRequest request)
    {
        var pkg = await uow.Packages.GetByIdAsync(request.Id)
            ?? throw new NotFoundException(nameof(Package), request.Id);

        request.Adapt(pkg);
        await uow.Packages.UpdateAsync(pkg);
        await uow.SaveChangesAsync();
        return pkg.Adapt<PackageDto>();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await uow.Packages.ExistsAsync(id))
            throw new NotFoundException(nameof(Package), id);
        await uow.Packages.DeleteAsync(id);
        await uow.SaveChangesAsync();
    }
}
