import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "NEXUS — Вхід" }] }),
  component: AuthPage,
});

function AuthPage() {
  const t   = useT();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [li,  setLi]  = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ email: "", password: "", username: "", full_name: "", phone_number: "" });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) nav({ to: "/dashboard" });
    });
    supabase.auth.getUser().then(({ data }) => { if (data.user) nav({ to: "/dashboard" }); });
    return () => subscription.unsubscribe();
  }, [nav]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(li);
    setLoading(false);
    if (error) return toast.error(t("auth_denied") + ": " + error.message);
    toast.success(t("auth_granted"));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: reg.email, password: reg.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { username: reg.username, full_name: reg.full_name, phone_number: reg.phone_number },
      },
    });
    if (error) { setLoading(false); return toast.error(t("auth_reg_failed") + ": " + error.message); }
    if (!data.session) await supabase.auth.signInWithPassword({ email: reg.email, password: reg.password });
    setLoading(false);
    toast.success(t("auth_welcome") + ", " + reg.username);
  }

  async function handleGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error(t("auth_oauth_err") + ": " + (res.error as Error).message);
  }

  return (
    <main className="page-shell min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-sm p-7">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-7">
          <span className="font-display font-black text-xl text-primary">NEXUS</span>
          <span className="text-[10px] font-mono text-muted-foreground">CYBER LOUNGE</span>
        </Link>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">{t("auth_login")}</TabsTrigger>
            <TabsTrigger value="register">{t("auth_register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3 mt-5">
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_email")}</Label>
                <Input type="email" required value={li.email}
                  onChange={(e) => setLi({ ...li, email: e.target.value })}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_password")}</Label>
                <Input type="password" required value={li.password}
                  onChange={(e) => setLi({ ...li, password: e.target.value })}
                  className="mt-1" />
              </div>
              <Button disabled={loading} className="w-full bg-primary text-primary-foreground mt-1">
                {loading ? "…" : t("auth_sign_in")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3 mt-5">
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_gamertag")}</Label>
                <Input required value={reg.username}
                  onChange={(e) => setReg({ ...reg, username: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_full_name")}</Label>
                <Input value={reg.full_name}
                  onChange={(e) => setReg({ ...reg, full_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_email")}</Label>
                <Input type="email" required value={reg.email}
                  onChange={(e) => setReg({ ...reg, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_phone")}</Label>
                <Input value={reg.phone_number}
                  onChange={(e) => setReg({ ...reg, phone_number: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_password")}</Label>
                <Input type="password" required minLength={6} value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })} className="mt-1" />
              </div>
              <Button disabled={loading} className="w-full bg-primary text-primary-foreground mt-1">
                {loading ? "…" : t("auth_create")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{t("auth_or")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" onClick={handleGoogle} className="w-full border-border hover:border-primary/40">
          {t("auth_google")}
        </Button>

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← {t("auth_return")}
          </Link>
        </div>
      </Card>
    </main>
  );
}
