namespace CyberHub.BLL.DTOs;

public record WorkstationDto(
    Guid   Id,
    Guid   ZoneId,
    string Name,
    int    PositionX,
    int    PositionY,
    bool   IsActive
);
