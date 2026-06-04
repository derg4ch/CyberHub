import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice } from "@/lib/gaming";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area,
} from "recharts";
import { useT } from "@/lib/i18n";
import { Pencil, Plus, Shield, ShieldOff, Trash2, FileDown, TrendingUp } from "lucide-react";
import { apiClient, type RevenueForecastPoint, type TopZoneDto, type HeatmapCell } from "@/lib/api-client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "NEXUS // ADMIN OPS" }] }),
  component: AdminPage,
});

const STATUSES = ["Pending", "Confirmed", "Active", "Completed", "No-Show", "Cancelled"] as const;
const TIERS = ["Standard", "Pro", "VIP", "Streaming", "VR"] as const;
const PKG_CATEGORIES = ["Hourly", "Daily", "Night", "Weekly", "Tournament", "VIP"] as const;
const TOURNAMENT_STATUSES = ["Upcoming", "Registration", "Live", "Completed", "Cancelled"] as const;
const TIER_COLORS: Record<string, string> = {
  Standard: "#38BDF8", Pro: "#7B2FBE", VIP: "#FBBF24", Streaming: "#00D4FF", VR: "#FF0066",
};
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AdminPage() {
  const t = useT();
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    if (!isAdmin) { toast.error(t("admin_access_denied")); nav({ to: "/dashboard" }); }
  }, [loading, user, isAdmin, nav, t]);
  if (loading || !user || !isAdmin)
    return <div className="min-h-screen grid place-items-center text-primary font-display">{t("admin_authorizing")}</div>;

  return (
    <>
      <SiteHeader />
      <main className="page-shell container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-accent mb-1 uppercase">{t("admin_ops")}</div>
            <h1 className="font-display font-black text-3xl text-primary">{t("admin_live")}</h1>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground border border-border px-2 py-1">
            {new Date().toLocaleDateString("uk-UA", { weekday: "short", day: "2-digit", month: "short" })}
          </div>
        </div>
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="bg-muted flex flex-wrap h-auto gap-0.5">
            {["live", "analytics", "zones", "packages", "tournaments", "users"].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="font-mono text-xs tracking-widest uppercase">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="live" className="mt-6"><LiveMonitor /></TabsContent>
          <TabsContent value="analytics" className="mt-6"><Analytics /></TabsContent>
          <TabsContent value="zones" className="mt-6"><ZonesAdmin /></TabsContent>
          <TabsContent value="packages" className="mt-6"><PackagesAdmin /></TabsContent>
          <TabsContent value="tournaments" className="mt-6"><TournamentsAdmin /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersAdmin /></TabsContent>
        </Tabs>
      </main>
    </>
  );
}

/* ── LIVE MONITOR ─────────────────────────────────────────────────────── */
function LiveMonitor() {
  const t = useT();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["all-bookings-today"],
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("bookings")
        .select("*, zones(name), workstations(name), packages(name), profiles!bookings_user_id_fkey(username)")
        .gte("start_time", today.toISOString())
        .order("start_time");
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase.channel("admin-bk")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () =>
        qc.invalidateQueries({ queryKey: ["all-bookings-today"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status: status as typeof STATUSES[number] }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("admin_status_updated"));
  }

  const revenue = (q.data ?? []).filter((b: any) => b.status === "Completed").reduce((s: number, b: any) => s + Number(b.total_price), 0);
  const activeCount = (q.data ?? []).filter((b: any) => b.status === "Active").length;

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label={t("admin_today_rev")} value={formatPrice(revenue)} color="text-primary" />
        <StatCard label={t("admin_active_now")} value={String(activeCount)} color="text-green-400" />
        <StatCard label={t("admin_total")} value={String(q.data?.length ?? 0)} color="text-foreground" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATUSES.map((st) => (
          <div key={st}>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-2 border-b border-border pb-1">{st}</div>
            <div className="space-y-2 min-h-[60px]">
              {(q.data ?? []).filter((b: any) => b.status === st).map((b: any) => (
                <Card key={b.id} className="glass-card p-3 text-xs">
                  <div className="font-display text-primary text-xs">{b.profiles?.username ?? "—"}</div>
                  <div className="text-muted-foreground">{b.zones?.name} · {b.workstations?.name}</div>
                  <div className="font-mono text-muted-foreground text-[10px]">{new Date(b.start_time).toLocaleTimeString()}</div>
                  <Select value={b.status} onValueChange={(v) => setStatus(b.id, v)}>
                    <SelectTrigger className="mt-2 h-6 text-[10px] bg-background border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="glass-card p-4 border-l-2 border-l-primary/50">
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className={`font-display text-2xl font-black ${color}`}>{value}</div>
    </Card>
  );
}

/* ── ANALYTICS ────────────────────────────────────────────────────────── */
function Analytics() {
  const t = useT();
  const chartAreaRef = useRef<HTMLDivElement>(null);

  const q = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 14);
      const { data } = await supabase.from("bookings").select("*, zones(name, tier), packages(name)").gte("created_at", since.toISOString());
      return data ?? [];
    },
  });

  const forecastQ = useQuery({
    queryKey: ["analytics-forecast"],
    queryFn: () => apiClient.analytics.revenueForecast(),
    retry: false,
  });

  const topZonesQ = useQuery({
    queryKey: ["analytics-top-zones"],
    queryFn: () => apiClient.analytics.topZones(),
    retry: false,
  });

  const heatmapQ = useQuery({
    queryKey: ["analytics-heatmap"],
    queryFn: () => apiClient.analytics.heatmap(),
    retry: false,
  });

  const data = q.data ?? [];

  const revByZone = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((b: any) => { const n = b.zones?.name ?? "—"; m[n] = (m[n] ?? 0) + Number(b.total_price); });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data]);

  const dailyBookings = useMemo(() => {
    const m: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); m[d.toISOString().slice(5, 10)] = 0; }
    data.forEach((b: any) => { const k = new Date(b.created_at).toISOString().slice(5, 10); if (k in m) m[k]++; });
    return Object.entries(m).map(([date, count]) => ({ date, count }));
  }, [data]);

  const byTier = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((b: any) => { const tier = b.zones?.tier ?? "—"; m[tier] = (m[tier] ?? 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data]);

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFillColor(3, 4, 10);
    doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(0, 212, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("NEXUS // CYBER LOUNGE", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(107, 127, 163);
    doc.text(`Analytics Report — ${new Date().toLocaleDateString("uk-UA")}`, 14, 28);

    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.3);
    doc.line(14, 31, 196, 31);

    let y = 40;
    doc.setTextColor(0, 212, 255);
    doc.setFontSize(13);
    doc.text("Revenue by Zone (last 14 days)", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Zone", "Revenue (UAH)"]],
      body: revByZone.map((r) => [r.name, `${r.value.toFixed(2)}`]),
      theme: "grid",
      headStyles: { fillColor: [0, 50, 60], textColor: [0, 212, 255], fontStyle: "bold" },
      bodyStyles: { fillColor: [13, 15, 26], textColor: [232, 244, 248] },
      alternateRowStyles: { fillColor: [20, 24, 40] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setTextColor(0, 212, 255);
    doc.setFontSize(13);
    doc.text("Bookings — last 14 days", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Date", "Bookings"]],
      body: dailyBookings.map((r) => [r.date, String(r.count)]),
      theme: "grid",
      headStyles: { fillColor: [0, 50, 60], textColor: [0, 212, 255], fontStyle: "bold" },
      bodyStyles: { fillColor: [13, 15, 26], textColor: [232, 244, 248] },
      alternateRowStyles: { fillColor: [20, 24, 40] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    if (topZonesQ.data && topZonesQ.data.length > 0) {
      if (y > 230) { doc.addPage(); doc.setFillColor(3, 4, 10); doc.rect(0, 0, 210, 297, "F"); y = 20; }
      doc.setTextColor(0, 212, 255);
      doc.setFontSize(13);
      doc.text("Top 5 Zones by Bookings (last 30 days)", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["#", "Zone", "Tier", "Bookings", "Revenue (UAH)"]],
        body: topZonesQ.data.map((r, i) => [String(i + 1), r.zoneName, r.tier, String(r.bookingCount), r.totalRevenue.toFixed(2)]),
        theme: "grid",
        headStyles: { fillColor: [0, 50, 60], textColor: [0, 212, 255], fontStyle: "bold" },
        bodyStyles: { fillColor: [13, 15, 26], textColor: [232, 244, 248] },
        alternateRowStyles: { fillColor: [20, 24, 40] },
        margin: { left: 14, right: 14 },
      });
    }

    doc.save(`nexus-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF exported");
  }

  const heatmapData = useMemo(() => {
    if (heatmapQ.data && heatmapQ.data.length > 0) return heatmapQ.data;
    const m: Record<string, number> = {};
    data.forEach((b: any) => {
      const dt = new Date(b.created_at ?? b.start_time);
      const key = `${dt.getDay()}-${dt.getHours()}`;
      m[key] = (m[key] ?? 0) + 1;
    });
    const cells: HeatmapCell[] = [];
    Object.entries(m).forEach(([k, count]) => {
      const [d, h] = k.split("-").map(Number);
      cells.push({ dayOfWeek: d, hour: h, count });
    });
    return cells;
  }, [heatmapQ.data, data]);

  const maxHeat = useMemo(() => Math.max(1, ...heatmapData.map((c) => c.count)), [heatmapData]);

  const topZonesDisplay = useMemo<TopZoneDto[]>(() => {
    if (topZonesQ.data && topZonesQ.data.length > 0) return topZonesQ.data;
    const m: Record<string, { zoneName: string; tier: string; bookingCount: number; totalRevenue: number }> = {};
    data.forEach((b: any) => {
      const n = b.zones?.name ?? "—";
      if (!m[n]) m[n] = { zoneName: n, tier: b.zones?.tier ?? "—", bookingCount: 0, totalRevenue: 0 };
      m[n].bookingCount++;
      m[n].totalRevenue += Number(b.total_price ?? 0);
    });
    return Object.values(m).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);
  }, [topZonesQ.data, data]);

  const forecastDisplay = useMemo<RevenueForecastPoint[]>(() => {
    if (forecastQ.data && forecastQ.data.length > 0) return forecastQ.data;
    const m: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); m[d.toISOString().slice(5, 10)] = 0; }
    data.filter((b: any) => b.status === "Completed").forEach((b: any) => {
      const k = new Date(b.created_at).toISOString().slice(5, 10);
      if (k in m) m[k] += Number(b.total_price);
    });
    const vals = Object.values(m);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const hist: RevenueForecastPoint[] = Object.entries(m).map(([date, actual]) => ({ date, actual, forecast: null }));
    for (let i = 1; i <= 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      hist.push({ date: d.toISOString().slice(5, 10), actual: null, forecast: Math.round(avg) });
    }
    return hist;
  }, [forecastQ.data, data]);

  return (
    <div className="space-y-6" ref={chartAreaRef}>
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-primary">{t("admin_analytics")}</h2>
        <Button
          onClick={exportPDF}
          className="bg-accent/15 hover:bg-accent/25 text-accent border border-accent/40 font-mono text-xs tracking-widest"
          variant="outline"
        >
          <FileDown className="w-3.5 h-3.5 mr-1.5" />
          EXPORT PDF
        </Button>
      </div>

      {/* Existing charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card p-4">
          <div className="font-mono text-xs text-primary mb-3 tracking-wider">{t("admin_rev_by_zone")}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revByZone}>
              <CartesianGrid stroke="#1A1F35" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#6B7FA3", fontSize: 10 }} />
              <YAxis tick={{ fill: "#6B7FA3", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #00D4FF30", fontSize: 11 }} />
              <Bar dataKey="value" fill="#00D4FF" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="glass-card p-4">
          <div className="font-mono text-xs text-primary mb-3 tracking-wider">{t("admin_book_14")}</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyBookings}>
              <CartesianGrid stroke="#1A1F35" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#6B7FA3", fontSize: 10 }} />
              <YAxis tick={{ fill: "#6B7FA3", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #00D4FF30", fontSize: 11 }} />
              <Line type="monotone" dataKey="count" stroke="#FF0066" strokeWidth={2} dot={{ fill: "#00D4FF", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="glass-card p-4 md:col-span-2">
          <div className="font-mono text-xs text-primary mb-3 tracking-wider">{t("admin_book_tier")}</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byTier} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {byTier.map((d) => <Cell key={d.name} fill={TIER_COLORS[d.name] ?? "#00D4FF"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #00D4FF30", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── NEW: Revenue Forecast ──────────────────────────────────── */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-accent" />
          <div className="font-mono text-xs text-primary tracking-wider">REVENUE FORECAST — NEXT 7 DAYS</div>
          {forecastQ.isError && <span className="text-[10px] text-amber-400 font-mono ml-auto">Supabase fallback</span>}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono mb-3">Simple moving average based on last 7 days</div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={forecastDisplay}>
            <CartesianGrid stroke="#1A1F35" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#6B7FA3", fontSize: 10 }} />
            <YAxis tick={{ fill: "#6B7FA3", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0D0F1A", border: "1px solid #00D4FF30", fontSize: 11 }} />
            <Area type="monotone" dataKey="actual" fill="#00D4FF15" stroke="#00D4FF" strokeWidth={2} dot={{ r: 3, fill: "#00D4FF" }} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#FF6B00" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: "#FF6B00" }} name="Forecast" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-primary" /><span className="text-[10px] font-mono text-muted-foreground">Actual revenue</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-orange-500 border-dashed" style={{ borderTop: "2px dashed #FF6B00", height: 0 }} /><span className="text-[10px] font-mono text-muted-foreground">Forecast</span></div>
        </div>
      </Card>

      {/* ── NEW: Top-5 Zones ──────────────────────────────────────── */}
      <Card className="glass-card p-4">
        <div className="font-mono text-xs text-primary mb-3 tracking-wider">TOP-5 ZONES BY BOOKINGS (30 days)</div>
        {topZonesDisplay.length === 0
          ? <div className="text-muted-foreground font-mono text-xs py-6 text-center">// NO DATA</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">#</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">Zone</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">Tier</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-normal">Bookings</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-normal">Revenue</th>
                    <th className="py-2 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {topZonesDisplay.map((z, i) => {
                    const maxBookings = topZonesDisplay[0].bookingCount;
                    const pct = maxBookings > 0 ? (z.bookingCount / maxBookings) * 100 : 0;
                    return (
                      <tr key={z.zoneName} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                        <td className="py-2.5 px-3 text-muted-foreground">{i + 1}</td>
                        <td className="py-2.5 px-3 text-foreground font-display text-xs">{z.zoneName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ color: TIER_COLORS[z.tier] ?? "#00D4FF", border: `1px solid ${TIER_COLORS[z.tier] ?? "#00D4FF"}40`, background: `${TIER_COLORS[z.tier] ?? "#00D4FF"}10` }}>
                            {z.tier}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-primary">{z.bookingCount}</td>
                        <td className="py-2.5 px-3 text-right text-foreground">{formatPrice(z.totalRevenue)}</td>
                        <td className="py-2.5 px-3 w-24">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: TIER_COLORS[z.tier] ?? "#00D4FF" }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {/* ── NEW: Activity Heatmap ─────────────────────────────────── */}
      <Card className="glass-card p-4">
        <div className="font-mono text-xs text-primary mb-1 tracking-wider">ACTIVITY HEATMAP — HOUR × DAY</div>
        <div className="text-[10px] text-muted-foreground font-mono mb-4">Busiest periods over the last 30 days</div>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="flex gap-1 mb-1 pl-10">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="w-5 text-center text-[9px] font-mono text-muted-foreground shrink-0">{h}</div>
              ))}
            </div>
            {DAY_LABELS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1 mb-0.5">
                <div className="w-9 text-[10px] font-mono text-muted-foreground shrink-0 text-right pr-1">{day}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmapData.find((c) => c.dayOfWeek === dayIdx && c.hour === hour);
                  const intensity = cell ? cell.count / maxHeat : 0;
                  const alpha = 0.06 + intensity * 0.9;
                  return (
                    <div
                      key={hour}
                      className="w-5 h-5 rounded-sm shrink-0 cursor-default transition-all"
                      style={{ background: `rgba(0, 212, 255, ${alpha})` }}
                      title={`${day} ${hour}:00 — ${cell?.count ?? 0} bookings`}
                    />
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 pl-10">
              <div className="text-[9px] font-mono text-muted-foreground">Low</div>
              {[0.06, 0.25, 0.5, 0.75, 0.96].map((a) => (
                <div key={a} className="w-4 h-4 rounded-sm" style={{ background: `rgba(0, 212, 255, ${a})` }} />
              ))}
              <div className="text-[9px] font-mono text-muted-foreground">High</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── ZONES ────────────────────────────────────────────────────────────── */
function ZonesAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-zones"], queryFn: async () => {
      const { data, error } = await supabase.from("zones").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete this zone? Workstations & bookings linked to it may break.")) return;
    const { error } = await supabase.from("zones").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Zone deleted"); qc.invalidateQueries({ queryKey: ["admin-zones"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-primary">Zones</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} size="sm" className="bg-primary text-primary-foreground font-mono text-xs tracking-wider">
          <Plus className="w-3.5 h-3.5 mr-1" />NEW ZONE
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(q.data ?? []).map((z: any) => (
          <Card key={z.id} className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display text-base text-primary">{z.name}</div>
                <div className="text-[10px] font-mono text-accent">{z.tier} · {formatPrice(z.hourly_rate)}/h · {z.seat_count} seats</div>
              </div>
              <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${z.is_active ? "bg-green-400/15 text-green-300" : "bg-muted text-muted-foreground"}`}>
                {z.is_active ? "ACTIVE" : "OFFLINE"}
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{z.description}</div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditing(z); setOpen(true); }}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/40" onClick={() => remove(z.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <ZoneDialog open={open} onOpenChange={setOpen} zone={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-zones"] })} />
    </div>
  );
}

function ZoneDialog({ open, onOpenChange, zone, onSaved }: { open: boolean; onOpenChange: (b: boolean) => void; zone: any; onSaved: () => void }) {
  const [form, setForm] = useState<any>({ name: "", tier: "Standard", hourly_rate: 0, seat_count: 0, description: "", image_url: "", is_active: true });
  useEffect(() => {
    if (zone) setForm({ name: zone.name, tier: zone.tier, hourly_rate: zone.hourly_rate, seat_count: zone.seat_count, description: zone.description ?? "", image_url: zone.image_url ?? "", is_active: zone.is_active });
    else setForm({ name: "", tier: "Standard", hourly_rate: 0, seat_count: 0, description: "", image_url: "", is_active: true });
  }, [zone, open]);

  async function save() {
    const payload = { ...form, hourly_rate: Number(form.hourly_rate), seat_count: Number(form.seat_count) };
    const { error } = zone ? await supabase.from("zones").update(payload).eq("id", zone.id) : await supabase.from("zones").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(zone ? "Zone updated" : "Zone created");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-primary/30 max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-primary text-base">{zone ? "EDIT ZONE" : "NEW ZONE"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-primary/30" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Tier</Label>
              <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                <SelectTrigger className="bg-background border-primary/30"><SelectValue /></SelectTrigger>
                <SelectContent>{TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Hourly Rate</Label><Input type="number" step="0.01" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} className="bg-background border-primary/30" /></div>
          </div>
          <div><Label className="text-xs">Seats</Label><Input type="number" value={form.seat_count} onChange={(e) => setForm({ ...form, seat_count: e.target.value })} className="bg-background border-primary/30" /></div>
          <div><Label className="text-xs">Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="bg-background border-primary/30" /></div>
          <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-primary/30" /></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">Active</Label></div>
        </div>
        <DialogFooter><Button onClick={save} className="bg-primary text-primary-foreground font-mono text-xs">SAVE</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── PACKAGES ─────────────────────────────────────────────────────────── */
function PackagesAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-packages"], queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete this package?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Package deleted"); qc.invalidateQueries({ queryKey: ["admin-packages"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-primary">Packages</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} size="sm" className="bg-primary text-primary-foreground font-mono text-xs tracking-wider">
          <Plus className="w-3.5 h-3.5 mr-1" />NEW PACKAGE
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(q.data ?? []).map((p: any) => (
          <Card key={p.id} className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display text-base text-primary">{p.name}</div>
                <div className="text-[10px] font-mono text-accent">{p.category} · {formatPrice(p.price)} · {p.duration_minutes}min · {p.xp_reward}XP</div>
              </div>
              <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${p.is_active ? "bg-green-400/15 text-green-300" : "bg-muted text-muted-foreground"}`}>
                {p.is_active ? "ACTIVE" : "OFF"}
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{p.description}</div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/40" onClick={() => remove(p.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <PackageDialog open={open} onOpenChange={setOpen} pkg={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-packages"] })} />
    </div>
  );
}

function PackageDialog({ open, onOpenChange, pkg, onSaved }: { open: boolean; onOpenChange: (b: boolean) => void; pkg: any; onSaved: () => void }) {
  const [form, setForm] = useState<any>({ name: "", category: "Hourly", price: 0, duration_minutes: 60, xp_reward: 50, description: "", is_active: true });
  useEffect(() => {
    if (pkg) setForm({ name: pkg.name, category: pkg.category, price: pkg.price, duration_minutes: pkg.duration_minutes, xp_reward: pkg.xp_reward, description: pkg.description ?? "", is_active: pkg.is_active });
    else setForm({ name: "", category: "Hourly", price: 0, duration_minutes: 60, xp_reward: 50, description: "", is_active: true });
  }, [pkg, open]);

  async function save() {
    const payload = { ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes), xp_reward: Number(form.xp_reward) };
    const { error } = pkg ? await supabase.from("packages").update(payload).eq("id", pkg.id) : await supabase.from("packages").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(pkg ? "Package updated" : "Package created");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-primary/30 max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-primary text-base">{pkg ? "EDIT PACKAGE" : "NEW PACKAGE"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-primary/30" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-background border-primary/30"><SelectValue /></SelectTrigger>
                <SelectContent>{PKG_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Price</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-background border-primary/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="bg-background border-primary/30" /></div>
            <div><Label className="text-xs">XP Reward</Label><Input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: e.target.value })} className="bg-background border-primary/30" /></div>
          </div>
          <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-primary/30" /></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">Active</Label></div>
        </div>
        <DialogFooter><Button onClick={save} className="bg-primary text-primary-foreground font-mono text-xs">SAVE</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── TOURNAMENTS ──────────────────────────────────────────────────────── */
function TournamentsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-tournaments"], queryFn: async () => {
      const { data, error } = await supabase.from("tournaments").select("*").order("start_time", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete this tournament?")) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Tournament deleted"); qc.invalidateQueries({ queryKey: ["admin-tournaments"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-primary">Tournaments</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} size="sm" className="bg-primary text-primary-foreground font-mono text-xs tracking-wider">
          <Plus className="w-3.5 h-3.5 mr-1" />NEW TOURNAMENT
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {(q.data ?? []).map((tn: any) => (
          <Card key={tn.id} className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display text-base text-primary">{tn.name}</div>
                <div className="text-[10px] font-mono text-accent">{tn.game} · {tn.status}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{tn.start_time ? new Date(tn.start_time).toLocaleString() : "TBD"}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-muted-foreground font-mono">PRIZE</div>
                <div className="font-display text-amber-400 text-sm">{formatPrice(tn.prize_pool)}</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">Entry: {formatPrice(tn.entry_fee)} · Slots: {tn.current_participants}/{tn.max_participants}</div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditing(tn); setOpen(true); }}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/40" onClick={() => remove(tn.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <TournamentDialog open={open} onOpenChange={setOpen} tournament={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-tournaments"] })} />
    </div>
  );
}

function TournamentDialog({ open, onOpenChange, tournament, onSaved }: { open: boolean; onOpenChange: (b: boolean) => void; tournament: any; onSaved: () => void }) {
  const [form, setForm] = useState<any>({ name: "", game: "", description: "", start_time: "", prize_pool: 0, entry_fee: 0, max_participants: 16, status: "Upcoming", image_url: "" });
  useEffect(() => {
    if (tournament) setForm({
      name: tournament.name, game: tournament.game ?? "", description: tournament.description ?? "",
      start_time: tournament.start_time ? new Date(tournament.start_time).toISOString().slice(0, 16) : "",
      prize_pool: tournament.prize_pool, entry_fee: tournament.entry_fee, max_participants: tournament.max_participants,
      status: tournament.status, image_url: tournament.image_url ?? "",
    });
    else setForm({ name: "", game: "", description: "", start_time: "", prize_pool: 0, entry_fee: 0, max_participants: 16, status: "Upcoming", image_url: "" });
  }, [tournament, open]);

  async function save() {
    const payload = { ...form, prize_pool: Number(form.prize_pool), entry_fee: Number(form.entry_fee), max_participants: Number(form.max_participants), start_time: form.start_time ? new Date(form.start_time).toISOString() : null };
    const { error } = tournament ? await supabase.from("tournaments").update(payload).eq("id", tournament.id) : await supabase.from("tournaments").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(tournament ? "Tournament updated" : "Tournament created");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-primary/30 max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-primary text-base">{tournament ? "EDIT TOURNAMENT" : "NEW TOURNAMENT"}</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-primary/30" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Game</Label><Input value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} className="bg-background border-primary/30" /></div>
            <div><Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-background border-primary/30"><SelectValue /></SelectTrigger>
                <SelectContent>{TOURNAMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-xs">Start Time</Label><Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="bg-background border-primary/30" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Prize Pool</Label><Input type="number" step="0.01" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} className="bg-background border-primary/30" /></div>
            <div><Label className="text-xs">Entry Fee</Label><Input type="number" step="0.01" value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: e.target.value })} className="bg-background border-primary/30" /></div>
            <div><Label className="text-xs">Max</Label><Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} className="bg-background border-primary/30" /></div>
          </div>
          <div><Label className="text-xs">Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="bg-background border-primary/30" /></div>
          <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-primary/30" /></div>
        </div>
        <DialogFooter><Button onClick={save} className="bg-primary text-primary-foreground font-mono text-xs">SAVE</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── USERS ────────────────────────────────────────────────────────────── */
function UsersAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-users"], queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const adminSet = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
      return (profiles ?? []).map((p: any) => ({ ...p, isAdmin: adminSet.has(p.id) }));
    },
  });
  const [search, setSearch] = useState("");

  async function toggleAdmin(uid: string, makeAdmin: boolean) {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" } as any);
      if (error) return toast.error(error.message);
      toast.success("Admin granted");
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin revoked");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const filtered = (q.data ?? []).filter((u: any) =>
    !search || (u.username ?? "").toLowerCase().includes(search.toLowerCase()) || (u.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <h2 className="font-display text-xl text-primary">Users</h2>
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs bg-background border-primary/30" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((u: any) => (
          <Card key={u.id} className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display text-sm text-primary">{u.username ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{u.full_name}</div>
                <div className="text-[10px] font-mono text-accent">LVL {u.level} · {u.xp_points}XP · {u.total_sessions} sessions</div>
              </div>
              {u.isAdmin && <div className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400/15 text-amber-300">ADMIN</div>}
            </div>
            <Button size="sm" variant="outline" className={`h-7 text-xs ${u.isAdmin ? "text-destructive border-destructive/40" : ""}`} onClick={() => toggleAdmin(u.id, !u.isAdmin)}>
              {u.isAdmin ? <><ShieldOff className="w-3 h-3 mr-1" />Revoke admin</> : <><Shield className="w-3 h-3 mr-1" />Make admin</>}
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-muted-foreground font-mono text-xs col-span-full text-center py-8">// NO USERS</div>}
      </div>
    </div>
  );
}
