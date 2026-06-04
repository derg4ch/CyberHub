import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { toast } from "sonner";
import { TIER_COLORS, STATUS_COLORS, levelTitle, formatPrice } from "@/lib/gaming";
import { Crown, LogOut, Zap, Trophy, Clock, Calendar } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "NEXUS // OPERATOR DASHBOARD" }] }),
  component: Dashboard,
});

function Dashboard() {
  const t = useT();
  const nav = useNavigate();
  const { user, profile, isAdmin, loading, reload } = useAuth();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);
  if (loading || !user || !profile) return <div className="min-h-screen grid place-items-center text-primary font-display">{t("dash_loading")}</div>;

  const nextLevelXp = profile.level * 500;
  const prevLevelXp = (profile.level - 1) * 500;
  const pct = ((profile.xp_points - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  return (
    <>
      <SiteHeader />
      <main className="page-shell container mx-auto px-4 py-8">
        <Card className="glass-card p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full grid place-items-center font-display text-2xl text-primary border-2 border-primary bg-primary/10">
                {(profile.username ?? "?").slice(0,2).toUpperCase()}
              </div>
              <div>
                <div className="font-display text-2xl text-primary">{profile.username}</div>
                <div className="text-xs text-muted-foreground">{profile.full_name} В· {user.email}</div>
              </div>
              {profile.level >= 4 && <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/50 font-display"><Crown className="w-3 h-3 mr-1" /> {t("dash_vip")}</Badge>}
            </div>
            <div className="flex gap-2">
              {isAdmin && <Link to="/admin"><Button variant="outline" className="border-accent/60 text-accent font-display">{t("dash_admin")}</Button></Link>}
              <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }} className="border-primary/40 font-display"><LogOut className="w-4 h-4 mr-1" /> {t("dash_logout")}</Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-primary">{t("dash_lvl")} {profile.level} В· {levelTitle(profile.level)}</span>
              <span className="text-muted-foreground">{profile.xp_points} / {nextLevelXp} XP</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5">
            <Stat icon={<Zap className="w-4 h-4" />} label={t("dash_xp")} value={profile.xp_points} />
            <Stat icon={<Trophy className="w-4 h-4" />} label={t("dash_sessions")} value={profile.total_sessions} />
            <Stat icon={<Clock className="w-4 h-4" />} label={t("dash_hours")} value={Number(profile.total_hours).toFixed(1)} />
          </div>
        </Card>

        <Tabs defaultValue="book">
          <TabsList className="bg-muted">
            <TabsTrigger value="book" className="font-medium">{t("dash_new_session")}</TabsTrigger>
            <TabsTrigger value="sessions" className="font-medium">{t("dash_my_sessions")}</TabsTrigger>
            <TabsTrigger value="tournaments" className="font-medium">{t("dash_tournaments")}</TabsTrigger>
            <TabsTrigger value="profile" className="font-medium">{t("dash_profile")}</TabsTrigger>
          </TabsList>

          <TabsContent value="book"><BookingWizard userId={user.id} onBooked={reload} /></TabsContent>
          <TabsContent value="sessions"><MySessions userId={user.id} /></TabsContent>
          <TabsContent value="tournaments"><TournamentsTab userId={user.id} /></TabsContent>
          <TabsContent value="profile"><ProfileTab profile={profile} onSaved={reload} /></TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="glass-card p-3 text-center">
      <div className="text-primary flex justify-center mb-1">{icon}</div>
      <div className="font-display text-xl text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function BookingWizard({ userId, onBooked }: { userId: string; onBooked: () => void }) {
  const t = useT();
  const qc = useQueryClient();
  const [packageId, setPackageId] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [wsId, setWsId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [time, setTime] = useState<string>("18:00");
  const [submitting, setSubmitting] = useState(false);

  const pkgQ = useQuery({ queryKey: ["packages"], queryFn: async () => (await supabase.from("packages").select("*").eq("is_active", true).order("price")).data ?? [] });
  const zonesQ = useQuery({ queryKey: ["zones"], queryFn: async () => (await supabase.from("zones").select("*").eq("is_active", true)).data ?? [] });
  const wsQ = useQuery({ queryKey: ["workstations", zoneId], enabled: !!zoneId, queryFn: async () => (await supabase.from("workstations").select("*").eq("zone_id", zoneId).eq("is_active", true)).data ?? [] });

  const pkg = pkgQ.data?.find((p: any) => p.id === packageId);
  const zone = zonesQ.data?.find((z: any) => z.id === zoneId);
  const startISO = `${date}T${time}:00`;
  const endISO = pkg ? new Date(new Date(startISO).getTime() + pkg.duration_minutes * 60_000).toISOString() : "";

  async function book() {
    if (!packageId || !zoneId || !wsId || !pkg) return toast.error(t("dash_complete_all"));
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: userId, workstation_id: wsId, zone_id: zoneId, package_id: packageId,
      start_time: new Date(startISO).toISOString(), end_time: endISO,
      total_price: pkg.price, xp_earned: pkg.xp_reward, status: "Pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(t("dash_booked"));
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
    onBooked();
    setPackageId(""); setZoneId(""); setWsId("");
  }

  return (
    <Card className="glass-card p-6 space-y-6">
      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_step1")}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pkgQ.data?.map((p: any) => (
            <button key={p.id} onClick={() => setPackageId(p.id)} className={`text-left p-4 border transition ${packageId === p.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <div className="text-xs text-muted-foreground font-mono">{p.category}</div>
              <div className="font-display">{p.name}</div>
              <div className="text-primary font-display text-lg">{formatPrice(p.price)}</div>
              <div className="text-xs text-muted-foreground">+{p.xp_reward} XP</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_step2")}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {zonesQ.data?.map((z: any) => (
            <button key={z.id} onClick={() => { setZoneId(z.id); setWsId(""); }} className={`text-left p-4 border transition ${zoneId === z.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <Badge className={`border ${TIER_COLORS[z.tier]}`}>{z.tier}</Badge>
              <div className="font-display mt-2">{z.name}</div>
              <div className="text-xs text-muted-foreground">{formatPrice(z.hourly_rate)}{t("per_hour")}</div>
            </button>
          ))}
        </div>
        {zoneId && (
          <div className="flex flex-wrap gap-2">
            {wsQ.data?.map((w: any) => (
              <button key={w.id} onClick={() => setWsId(w.id)} className={`px-3 py-2 border font-mono text-xs transition-colors ${wsId === w.id ? 'border-primary bg-primary/15 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'}`}>{w.name}</button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_step3")}</h3>
        <div className="flex gap-3 flex-wrap">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-primary/30 max-w-[200px]" />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-background border-primary/30 max-w-[160px]" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_step4")}</h3>
        <div className="glass-card p-4 font-mono text-sm space-y-1">
          <div>{t("dash_package")}: <span className="text-primary">{pkg?.name ?? "вЂ”"}</span></div>
          <div>{t("dash_zone")}: <span className="text-primary">{zone?.name ?? "вЂ”"}</span></div>
          <div>{t("dash_seat")}: <span className="text-primary">{wsQ.data?.find((w: any) => w.id === wsId)?.name ?? "вЂ”"}</span></div>
          <div>{t("dash_start")}: <span className="text-primary">{startISO}</span></div>
          <div>{t("dash_total")}: <span className="text-primary text-lg">{formatPrice(pkg?.price ?? 0)}</span></div>
        </div>
        <Button disabled={submitting} onClick={book} className="mt-4 bg-primary text-primary-foreground font-display tracking-wider">{t("dash_confirm_booking")}</Button>
      </div>
    </Card>
  );
}

function MySessions({ userId }: { userId: string }) {
  const t = useT();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-bookings", userId], queryFn: async () => {
    const { data } = await supabase.from("bookings").select("*, zones(name, tier), workstations(name), packages(name, duration_minutes)").eq("user_id", userId).order("start_time", { ascending: false });
    return data ?? [];
  }});

  useEffect(() => {
    const ch = supabase.channel("my-bk-"+userId).on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${userId}` }, (payload: any) => {
      qc.invalidateQueries({ queryKey: ["my-bookings", userId] });
      if (payload.new?.status === "Completed" && payload.old?.status !== "Completed") toast.success(`${t("dash_session_done")} +${payload.new.xp_earned} ${t("dash_xp_earned")}`);
      if (payload.new?.status === "Active" && payload.old?.status !== "Active") toast(t("dash_session_active"));
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc, t]);

  async function cancel(id: string) {
    const { error } = await supabase.from("bookings").update({ status: "Cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.warning(t("dash_cancelled"));
    qc.invalidateQueries({ queryKey: ["my-bookings", userId] });
  }

  const now = Date.now();
  const upcoming = (q.data ?? []).filter((b: any) => new Date(b.end_time).getTime() >= now && b.status !== "Cancelled");
  const past = (q.data ?? []).filter((b: any) => new Date(b.end_time).getTime() < now || b.status === "Cancelled");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_upcoming")}</h3>
        {upcoming.length === 0 && <p className="text-muted-foreground text-sm">{t("dash_no_upcoming")}</p>}
        <div className="grid md:grid-cols-2 gap-3">{upcoming.map((b: any) => (
          <Card key={b.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge className={`border ${TIER_COLORS[b.zones?.tier]}`}>{b.zones?.tier}</Badge>
              <Badge variant="outline" className={STATUS_COLORS[b.status]}>{b.status}</Badge>
            </div>
            <div className="font-display">{b.zones?.name} В· {b.workstations?.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{b.packages?.name} В· {new Date(b.start_time).toLocaleString()}</div>
            {(new Date(b.start_time).getTime() - now) > 24 * 3600_000 && (
              <Button size="sm" variant="outline" onClick={() => cancel(b.id)} className="mt-3 border-destructive/40 text-destructive">{t("dash_cancel")}</Button>
            )}
          </Card>
        ))}</div>
      </div>
      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_past")}</h3>
        <div className="grid md:grid-cols-2 gap-3">{past.map((b: any) => (
          <Card key={b.id} className="glass-card p-4 opacity-80">
            <div className="flex items-center justify-between mb-2">
              <Badge className={`border ${TIER_COLORS[b.zones?.tier]}`}>{b.zones?.tier}</Badge>
              <Badge variant="outline" className={STATUS_COLORS[b.status]}>{b.status}</Badge>
            </div>
            <div className="font-display">{b.zones?.name} В· {b.workstations?.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{new Date(b.start_time).toLocaleString()}</div>
          </Card>
        ))}</div>
      </div>
    </div>
  );
}

function TournamentsTab({ userId }: { userId: string }) {
  const t = useT();
  const qc = useQueryClient();
  const tQ = useQuery({ queryKey: ["all-tournaments"], queryFn: async () => (await supabase.from("tournaments").select("*").order("start_time")).data ?? [] });
  const rQ = useQuery({ queryKey: ["my-regs", userId], queryFn: async () => (await supabase.from("tournament_registrations").select("tournament_id").eq("user_id", userId)).data ?? [] });
  const regIds = new Set((rQ.data ?? []).map((r: any) => r.tournament_id));

  async function register(tn: any) {
    const { error } = await supabase.from("tournament_registrations").insert({ tournament_id: tn.id, user_id: userId });
    if (error) return toast.error(error.message);
    await supabase.from("tournaments").update({ current_participants: tn.current_participants + 1 }).eq("id", tn.id);
    toast.success(t("dash_glhf"));
    qc.invalidateQueries({ queryKey: ["all-tournaments"] });
    qc.invalidateQueries({ queryKey: ["my-regs", userId] });
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{tQ.data?.map((tn: any) => (
      <Card key={tn.id} className="glass-card p-4">
        <Badge className="font-display bg-primary/20 text-primary border-primary/40">{tn.status}</Badge>
        <div className="font-display text-lg mt-2">{tn.name}</div>
        <div className="text-xs text-muted-foreground">{tn.game}</div>
        <div className="font-display text-amber-400 text-xl mt-2">{formatPrice(tn.prize_pool)}</div>
        <div className="text-xs font-mono text-muted-foreground mb-3">{new Date(tn.start_time).toLocaleString()}</div>
        {regIds.has(tn.id) ? <Badge className="bg-green-500/20 text-green-300 border-green-400/40">{t("dash_registered")}</Badge>
          : tn.status === "Registration Open" && <Button size="sm" onClick={() => register(tn)} className="bg-primary text-primary-foreground font-display">{t("register_btn")}</Button>}
      </Card>
    ))}</div>
  );
}

function ProfileTab({ profile, onSaved }: { profile: any; onSaved: () => void }) {
  const t = useT();
  const [f, setF] = useState({ username: profile.username ?? "", full_name: profile.full_name ?? "", phone_number: profile.phone_number ?? "", avatar_url: profile.avatar_url ?? "" });
  const [saving, setSaving] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from("profiles").update(f).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t("dash_profile_saved"));
    onSaved();
  }
  const achQ = useQuery({ queryKey: ["ach-all"], queryFn: async () => (await supabase.from("achievements").select("*")).data ?? [] });
  const myAchQ = useQuery({ queryKey: ["my-ach", profile.id], queryFn: async () => (await supabase.from("user_achievements").select("achievement_id").eq("user_id", profile.id)).data ?? [] });
  const unlocked = new Set((myAchQ.data ?? []).map((a: any) => a.achievement_id));

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
          <div><Label>{t("auth_gamertag")}</Label><Input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} className="bg-background border-primary/30" /></div>
          <div><Label>{t("auth_full_name")}</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} className="bg-background border-primary/30" /></div>
          <div><Label>{t("auth_phone")}</Label><Input value={f.phone_number} onChange={(e) => setF({ ...f, phone_number: e.target.value })} className="bg-background border-primary/30" /></div>
          <div><Label>{t("dash_avatar")}</Label><Input value={f.avatar_url} onChange={(e) => setF({ ...f, avatar_url: e.target.value })} className="bg-background border-primary/30" /></div>
          <Button disabled={saving} className="bg-primary text-primary-foreground font-display sm:col-span-2">{t("dash_save_profile")}</Button>
        </form>
      </Card>
      <div>
        <h3 className="font-display text-primary mb-3">{t("dash_achievements")}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{achQ.data?.map((a: any) => {
          const got = unlocked.has(a.id);
          return (
            <Card key={a.id} className={`glass-card p-4 text-center ${got ? 'border-primary/50' : 'opacity-40'}`}>
              <Trophy className={`w-6 h-6 mx-auto mb-2 ${got ? 'text-amber-400' : 'text-muted-foreground'}`} />
              <div className="font-display text-sm">{got ? a.name : "???"}</div>
              <div className="text-xs text-muted-foreground">{a.description}</div>
              <div className="text-xs font-mono text-primary mt-1">+{a.xp_reward} XP</div>
            </Card>
          );
        })}</div>
      </div>
    </div>
  );
}

