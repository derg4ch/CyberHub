# CyberHub — NEXUS Cyber Lounge

Система управління комп'ютерним клубом. Курсова робота.

## Структура

```
CyberHub/
├── frontend/   — React 19 + TanStack Start + Supabase
└── backend/    — ASP.NET Core 8 (DAL / BLL / API) + PostgreSQL
```

## Запуск

### Backend
```powershell
cd backend/CyberHub.API
# Заповніть рядок підключення в appsettings.json
dotnet run
# Swagger: http://localhost:5000/swagger
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```
