const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export type RevenueForecastPoint = {
  date: string;
  actual: number | null;
  forecast: number | null;
};

export type TopZoneDto = {
  zoneName: string;
  tier: string;
  bookingCount: number;
  totalRevenue: number;
};

export type HeatmapCell = {
  dayOfWeek: number;
  hour: number;
  count: number;
};

export const apiClient = {
  analytics: {
    revenueForecast: () => get<RevenueForecastPoint[]>("/api/analytics/revenue-forecast"),
    topZones: () => get<TopZoneDto[]>("/api/analytics/top-zones"),
    heatmap: () => get<HeatmapCell[]>("/api/analytics/heatmap"),
  },
};
