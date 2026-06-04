import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useT, useLang, setLang, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["EN", "UK"];

export function SiteHeader() {
  const t      = useT();
  const lang   = useLang();
  const [open,     setOpen]     = useState(false);
  const [authed,   setAuthed]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV = [
    { href: "/#zones",       label: t("nav_zones") },
    { href: "/#packages",    label: t("nav_packages") },
    { href: "/#tournaments", label: t("nav_tournaments") },
    { href: "/#gallery",     label: t("nav_gallery") },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-[background,border-color] duration-200"
      style={{
        background:    scrolled ? "rgba(9,9,14,0.96)" : "transparent",
        backdropFilter:scrolled ? "blur(12px)"         : "none",
        borderBottom:  scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo — Orbitron лише тут */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="font-display font-black text-lg text-primary tracking-wider">NEXUS</span>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">CYBER LOUNGE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {n.label}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(LANGS.find((l) => l !== lang)!)}
            className="hidden sm:flex text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            {lang === "UK" ? "EN" : "UA"}
          </button>

          <Link to={authed ? "/dashboard" : "/auth"}>
            <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary border border-primary/25 hover:bg-primary/8 px-4 py-1.5 rounded cursor-pointer transition-colors">
              {authed ? t("nav_dashboard") : t("nav_login")}
            </span>
          </Link>

          <button
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-0.5">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-muted-foreground hover:text-foreground border-b border-border/40">
              {n.label}
            </a>
          ))}
          <div className="flex gap-2 pt-3">
            <button
              className="text-xs font-mono text-muted-foreground border border-border px-3 py-1.5 rounded"
              onClick={() => setLang(LANGS.find((l) => l !== lang)!)}
            >
              {lang === "UK" ? "EN" : "UA"}
            </button>
            <Link to={authed ? "/dashboard" : "/auth"} onClick={() => setOpen(false)} className="flex-1">
              <span className="flex w-full justify-center bg-primary text-primary-foreground text-sm font-medium py-2 rounded cursor-pointer">
                {authed ? t("nav_dashboard") : t("nav_login")}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
