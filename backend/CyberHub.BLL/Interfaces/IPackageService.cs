using CyberHub.BLL.DTOs;

namespace CyberHub.BLL.Interfaces;

public interface IPackageService
{
    Task<IEnumerable<PackageDto>> GetAllAsync(bool? active = null);
    Task<PackageDto?> GetByIdAsync(Guid id);
    Task<PackageDto> CreateAsync(CreatePackageRequest request);
    Task<PackageDto> UpdateAsync(UpdatePackageRequest request);
    Task DeleteAsync(Guid id);
}
