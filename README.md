# CyberHub — NEXUS Cyber Lounge

Система управління комп'ютерним клубом. Курсова робота з дисципліни «Проєктування інформаційних систем».

---

## Структура проєкту

```
CyberHub/
├── frontend/          React 19 + TanStack Start + Supabase
└── backend/           ASP.NET Core 8 — тришарова архітектура
    ├── CyberHub.DAL/  Моделі, DbContext, репозиторії, Unit of Work
    ├── CyberHub.BLL/  Сервіси, DTOs, Mapster, винятки, хелпери
    └── CyberHub.API/  Контролери, Middleware, розширення, Swagger
```

---

## Backend

### Технології

| Компонент | Технологія |
|-----------|-----------|
| Фреймворк | ASP.NET Core 8 |
| ORM | Entity Framework Core 8 |
| БД | PostgreSQL (Supabase) |
| Маппінг | Mapster 7 |
| Документація | Swagger / OpenAPI |

### Архітектурні патерни

- **Repository Pattern** — `IRepository<T>` + спеціалізовані репозиторії
- **Unit of Work** — `IUnitOfWork` агрегує всі репозиторії та `SaveChangesAsync`
- **Dependency Injection** — реєстрація через extension-методи в `ServiceExtensions`
- **Middleware** — централізована обробка винятків (`ExceptionMiddleware`)
- **Mapster** — маппінг між Entity і DTO через `MapsterConfig`

### Шари

**DAL** (`CyberHub.DAL`)
- `Models/` — сутності БД
- `Context/` — `AppDbContext`
- `Repositories/` — інтерфейси та реалізації
- `UnitOfWork/` — `IUnitOfWork` + `UnitOfWork`

**BLL** (`CyberHub.BLL`)
- `DTOs/` — об'єкти передачі даних
- `Interfaces/` — контракти сервісів
- `Services/` — бізнес-логіка
- `Mapping/` — `MapsterConfig`
- `Exceptions/` — `NotFoundException`, `ValidationException`, `BusinessException`
- `Helpers/` — `DateHelper`, `AnalyticsHelper`

**API** (`CyberHub.API`)
- `Controllers/` — Analytics, Zones, Packages, Bookings, Tournaments
- `Middleware/` — `ExceptionMiddleware`
- `Extensions/` — `ServiceExtensions`, `ApplicationExtensions`

### Запуск

```powershell
cd backend/CyberHub.API
dotnet run
```

Swagger UI: `http://localhost:5000/swagger`

Health check: `GET http://localhost:5000/health`

#### Підключення до БД

У файлі `backend/CyberHub.API/appsettings.json` замінити `YOUR_SUPABASE_DB_PASSWORD`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=db.<project>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<password>;SSL Mode=Require;Trust Server Certificate=true"
}
```

---

## Frontend

### Технології

| Компонент | Технологія |
|-----------|-----------|
| Фреймворк | React 19 + TanStack Start |
| Маршрутизація | TanStack Router |
| Стилі | Tailwind CSS 4 + shadcn/ui |
| БД / Auth | Supabase |
| Аналітика | Recharts + jsPDF |

### Запуск

```bash
cd frontend
npm install
npm run dev
```

Доступно на `http://localhost:5173`

### Змінні середовища

Файл `frontend/.env`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<key>
VITE_API_URL=http://localhost:5000
```

---

## База даних

Міграції Supabase знаходяться у `frontend/supabase/migrations/`.

Основні таблиці: `zones`, `workstations`, `packages`, `bookings`, `tournaments`, `profiles`, `user_roles`, `achievements`.
