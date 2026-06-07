const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5248";

const TOKEN_KEY = "cyberhub_token";

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (t: string)       => localStorage.setItem(TOKEN_KEY, t),
  clear: ()              => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

const get    = <T>(path: string)                  => request<T>(path);
const post   = <T>(path: string, body: unknown)   => request<T>(path, { method: "POST",   body: JSON.stringify(body) });
const put    = <T>(path: string, body: unknown)   => request<T>(path, { method: "PUT",    body: JSON.stringify(body) });
const patch  = <T>(path: string, body: unknown)   => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) });
const del    = <T>(path: string)                  => request<T>(path, { method: "DELETE" });

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserDto = {
  id: string; email: string; username: string | null; fullName: string | null;
  phoneNumber: string | null; avatarUrl: string | null; role: string;
  xpPoints: number; level: number; totalSessions: number; totalHours: number;
};
export type AuthResponse = { token: string; user: UserDto };

export type ZoneDto = {
  id: string; name: string; description?: string; tier: string;
  hourlyRate: number; seatCount: number; imageUrl?: string; isActive: boolean;
};
export type WorkstationDto = {
  id: string; zoneId: string; name: string; positionX: number; positionY: number; isActive: boolean;
};
export type PackageDto = {
  id: string; category: string; name: string; description?: string;
  price: number; durationMinutes: number; xpReward: number; isActive: boolean;
};
export type BookingDto = {
  id: string; userId: string; workstationId: string; zoneId: string; packageId?: string;
  startTime: string; endTime: string; status: string;
  totalPrice: number; xpEarned: number; notes?: string; createdAt: string;
  zoneName?: string; zoneTier?: string; workstationName?: string; packageName?: string;
  username?: string;
};
export type TournamentDto = {
  id: string; name: string; game?: string; description?: string;
  prizePool: number; entryFee: number; maxParticipants: number; currentParticipants: number;
  startTime?: string; status: string; imageUrl?: string;
};
export type RevenueForecastPoint = { date: string; actual: number | null; forecast: number | null };
export type TopZoneDto           = { zoneName: string; tier: string; bookingCount: number; totalRevenue: number };
export type HeatmapCell          = { dayOfWeek: number; hour: number; count: number };

// ─── API client ───────────────────────────────────────────────────────────────

export const apiClient = {
  auth: {
    login:         (email: string, password: string) =>
      post<AuthResponse>("/api/auth/login", { email, password }),
    register:      (data: { email: string; password: string; username: string; fullName?: string; phoneNumber?: string }) =>
      post<AuthResponse>("/api/auth/register", data),
    me:            ()                         => get<UserDto>("/api/auth/me"),
    updateProfile: (data: { username?: string; fullName?: string; phoneNumber?: string; avatarUrl?: string }) =>
      patch<UserDto>("/api/auth/me", data),
  },

  zones: {
    list:           (active?: boolean)         => get<ZoneDto[]>(`/api/zones${active !== undefined ? `?active=${active}` : ""}`),
    create:         (d: Omit<ZoneDto, "id">)   => post<ZoneDto>("/api/zones", { name: d.name, description: d.description, tier: d.tier, hourlyRate: d.hourlyRate, seatCount: d.seatCount, imageUrl: d.imageUrl, isActive: d.isActive }),
    update:         (d: ZoneDto)               => put<ZoneDto>(`/api/zones/${d.id}`, { id: d.id, name: d.name, description: d.description, tier: d.tier, hourlyRate: d.hourlyRate, seatCount: d.seatCount, imageUrl: d.imageUrl, isActive: d.isActive }),
    delete:         (id: string)               => del<void>(`/api/zones/${id}`),
    allWorkstations:(active?: boolean)         => get<WorkstationDto[]>(`/api/zones/workstations${active !== undefined ? `?active=${active}` : ""}`),
    workstations:   (zoneId: string, active?: boolean) =>
      get<WorkstationDto[]>(`/api/zones/${zoneId}/workstations${active !== undefined ? `?active=${active}` : ""}`),
  },

  packages: {
    list:   (active?: boolean) => get<PackageDto[]>(`/api/packages${active !== undefined ? `?active=${active}` : ""}`),
    create: (d: { category: string; name: string; description?: string; price: number; durationMinutes: number; xpReward: number; isActive: boolean }) =>
      post<PackageDto>("/api/packages", d),
    update: (d: PackageDto)    => put<PackageDto>(`/api/packages/${d.id}`, { id: d.id, category: d.category, name: d.name, description: d.description, price: d.price, durationMinutes: d.durationMinutes, xpReward: d.xpReward, isActive: d.isActive }),
    delete: (id: string)       => del<void>(`/api/packages/${id}`),
  },

  tournaments: {
    list:   (status?: string) => get<TournamentDto[]>(`/api/tournaments${status ? `?status=${status}` : ""}`),
    create: (d: { name: string; game?: string; description?: string; prizePool: number; entryFee: number; maxParticipants: number; startTime?: string; status: string; imageUrl?: string }) =>
      post<TournamentDto>("/api/tournaments", d),
    update: (d: TournamentDto) => put<TournamentDto>(`/api/tournaments/${d.id}`, { id: d.id, name: d.name, game: d.game, description: d.description, prizePool: d.prizePool, entryFee: d.entryFee, maxParticipants: d.maxParticipants, startTime: d.startTime, status: d.status, imageUrl: d.imageUrl }),
    delete: (id: string)       => del<void>(`/api/tournaments/${id}`),
  },

  bookings: {
    all:    (params?: { status?: string; from?: string; to?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      if (params?.from)   q.set("from", params.from);
      if (params?.to)     q.set("to", params.to);
      return get<BookingDto[]>(`/api/bookings${q.toString() ? `?${q}` : ""}`);
    },
    today:  ()              => get<BookingDto[]>("/api/bookings/today"),
    byUser: (userId: string) => get<BookingDto[]>(`/api/bookings/user/${userId}`),
    create: (data: { userId: string; workstationId: string; zoneId: string; packageId?: string; startTime: string; endTime: string; totalPrice: number; xpEarned: number; notes?: string }) =>
      post<BookingDto>("/api/bookings", data),
    setStatus: (id: string, status: string) => patch<void>(`/api/bookings/${id}/status`, { status }),
  },

  users: {
    list:    ()                                  => get<UserDto[]>("/api/users"),
    setRole: (id: string, role: string)          => patch<void>(`/api/users/${id}/role`, { role }),
  },

  analytics: {
    revenueForecast: () => get<RevenueForecastPoint[]>("/api/analytics/revenue-forecast"),
    topZones:        () => get<TopZoneDto[]>("/api/analytics/top-zones"),
    heatmap:         () => get<HeatmapCell[]>("/api/analytics/heatmap"),
  },
};
