import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
  const { user, login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [li,  setLi]  = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ email: "", password: "", username: "", fullName: "", phoneNumber: "" });

  useEffect(() => {
    if (user) nav({ to: "/dashboard" });
  }, [user, nav]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(li.email, li.password);
      toast.success(t("auth_granted"));
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(t("auth_denied") + ": " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await register({
        email:       reg.email,
        password:    reg.password,
        username:    reg.username,
        fullName:    reg.fullName || undefined,
        phoneNumber: reg.phoneNumber || undefined,
      });
      toast.success(t("auth_welcome") + ", " + reg.username);
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(t("auth_reg_failed") + ": " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
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
                <Input value={reg.fullName}
                  onChange={(e) => setReg({ ...reg, fullName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_email")}</Label>
                <Input type="email" required value={reg.email}
                  onChange={(e) => setReg({ ...reg, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("auth_phone")}</Label>
                <Input value={reg.phoneNumber}
                  onChange={(e) => setReg({ ...reg, phoneNumber: e.target.value })} className="mt-1" />
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

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← {t("auth_return")}
          </Link>
        </div>
      </Card>
    </main>
  );
}
