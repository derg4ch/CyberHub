import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, Users, X, ChevronLeft, ZoomIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TIER_COLORS, formatPrice } from "@/lib/gaming";
import { useT } from "@/lib/i18n";

/* ── Types ──────────────────────────────────────────────────── */
type GalleryItem = { id: string; imageUrl: string; title: string; category: string };

// Fallback placeholder when image fails to load
const FALLBACK_IMG = "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80";

const GALLERY_ITEMS: GalleryItem[] = [
  // Arena — verified IDs
  { id: "g1",  category: "Arena",       title: "Standard Arena — Row A",              imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
  { id: "g2",  category: "Arena",       title: "Pro Arena — Tournament Setup",        imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80" },
  { id: "g3",  category: "Arena",       title: "Pro Arena — Night Mode",              imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80" },
  { id: "g4",  category: "Arena",       title: "Standard Arena — Full House",         imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80" },
  // VIP
  { id: "g5",  category: "VIP",         title: "VIP Lounge — Private Booth",          imageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80" },
  { id: "g6",  category: "VIP",         title: "VIP Lounge — OLED Setup",             imageUrl: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&q=80" },
  // Streaming
  { id: "g7",  category: "Streaming",   title: "Streaming Studio — On Air",           imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80" },
  { id: "g8",  category: "Streaming",   title: "Streaming Studio — Dual PC Rig",      imageUrl: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=800&q=80" },
  // VR
  { id: "g9",  category: "VR",          title: "VR Zone — Full Immersion",            imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80" },
  { id: "g10", category: "VR",          title: "VR Zone — Haptic Suit Session",       imageUrl: "https://images.unsplash.com/photo-1478416272538-5f7e51dc5400?w=800&q=80" },
  // Tournaments
  { id: "g11", category: "Tournaments", title: "NEXUS CS2 Open Cup — Finals",         imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80" },
  { id: "g12", category: "Tournaments", title: "Dota 2 Championship — Stage",         imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80" },
  { id: "g13", category: "Tournaments", title: "NEXUS Spring Cup — Award Ceremony",   imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80" },
  // Community
  { id: "g14", category: "Community",   title: "Crew Night — Standard Zone",          imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" },
  { id: "g15", category: "Community",   title: "LAN Party — Saturday Madness",        imageUrl: "https://images.unsplash.com/photo-1583418855604-f9281d1fc8c5?w=800&q=80" },
];

const REVIEWS_EN = [
  { name: "VexPro",    rating: 5, text: "Pro Arena hits 240fps in CS2 flawlessly. This is what esports should feel like." },
  { name: "NeonByte",  rating: 5, text: "VIP lounge — private booth, RTX 4090, OLED. Came once, now I'm a regular." },
  { name: "QuantumQ",  rating: 5, text: "Booked the streaming studio for 6 hours. Audio, lighting, dual-PC — zero complaints." },
  { name: "GhostFrame",rating: 4, text: "The VR zone is something else. Haptic suit + Index headset = full immersion." },
  { name: "PulseRider",rating: 5, text: "Won my first tournament cash here at the NEXUS CS Cup. Electric atmosphere." },
  { name: "SynthRaven",rating: 5, text: "24/7 access kept me sane during exams. Best lounge in the city, full stop." },
];
const REVIEWS_UK = [
  { name: "VexPro",    rating: 5, text: "Pro Arena — 240 fps у CS2 без зусиль. Саме так має виглядати кіберспорт." },
  { name: "NeonByte",  rating: 5, text: "VIP-зал — приватна кабінка, RTX 4090, OLED. Прийшов раз, тепер постійний клієнт." },
  { name: "QuantumQ",  rating: 5, text: "Бронював стрім-студію на 6 годин. Звук, світло, dual-PC — без нарікань." },
  { name: "GhostFrame",rating: 4, text: "VR-зона — щось особливе. Хаптик-костюм + Index = повне занурення." },
  { name: "PulseRider",rating: 5, text: "Виграв перші гроші на NEXUS CS Cup. Атмосфера — на рівні великих турнірів." },
  { name: "SynthRaven",rating: 5, text: "Доступ 24/7 врятував мене на сесії. Найкращий клуб у місті." },
];

/* ── Fade-in animation variant ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

/* ── Lightbox ───────────────────────────────────────────────── */
function Lightbox({
  items, index, onClose, onPrev, onNext,
}: {
  items: GalleryItem[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const item = items[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/50 tracking-widest z-10">
        {index + 1} / {items.length}
      </div>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10 bg-black/40 rounded-full p-2"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Next */}
      {index < items.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10 bg-black/40 rounded-full p-2"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
        />
        <div className="mt-3 text-center">
          <div className="text-white font-medium text-base">{item.title}</div>
          <div className="text-white/50 text-xs mt-1">{item.category}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Landing ────────────────────────────────────────────────── */
export function CyberLanding() {
  const t = useT();
  const REVIEWS = t("eyebrow_signal") === "// СИГНАЛ" ? REVIEWS_UK : REVIEWS_EN;

  const zonesQ = useQuery({ queryKey: ["zones"],             queryFn: () => apiClient.zones.list(true) });
  const wsQ    = useQuery({ queryKey: ["workstations"],      queryFn: () => apiClient.zones.allWorkstations(true).catch(() => []) });
  const pkgQ   = useQuery({ queryKey: ["packages"],          queryFn: () => apiClient.packages.list(true) });
  const tQ     = useQuery({ queryKey: ["tournaments-public"],queryFn: () => apiClient.tournaments.list() });
  const gQ     = useQuery<GalleryItem[]>({ queryKey: ["gallery"], queryFn: () => Promise.resolve(GALLERY_ITEMS), staleTime: Infinity });

  const occupied = new Set<string>();

  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxIdx,   setLightboxIdx]   = useState<number | null>(null);

  const galleryCats  = ["All", ...Array.from(new Set((gQ.data ?? []).map((g) => g.category)))];
  const galleryItems = (gQ.data ?? []).filter((g) => galleryFilter === "All" || g.category === galleryFilter);

  // Map filtered index → global index for lightbox navigation
  const openLightbox = useCallback((filteredIdx: number) => setLightboxIdx(filteredIdx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevLightbox  = useCallback(() => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextLightbox  = useCallback(() => setLightboxIdx((i) => (i !== null && i < galleryItems.length - 1 ? i + 1 : i)), [galleryItems.length]);

  return (
    <>
    {/* ── LIGHTBOX ─────────────────────────────────────────── */}
    <AnimatePresence>
      {lightboxIdx !== null && (
        <Lightbox
          items={galleryItems}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </AnimatePresence>

    <main className="page-shell">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="min-h-[88vh] flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden" animate="show"
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="text-sm font-mono text-primary mb-5 tracking-wider">
              — {t("sys_online")}
            </motion.p>

            <motion.h1 variants={fadeUp}
              className="font-display font-black leading-[1.05] text-5xl sm:text-6xl lg:text-7xl text-foreground"
            >
              {t("hero_your")}{" "}
              <span className="text-primary">{t("hero_arena")}</span>
              <br />{t("hero_awaits")}
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 text-base text-muted-foreground max-w-xl">
              {t("hero_desc")}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="cta-glow bg-primary text-primary-foreground font-semibold">
                  {t("btn_book_seat")} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#zones">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:border-primary/50 hover:text-primary font-medium">
                  {t("btn_explore_zones")}
                </Button>
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
              {[
                { value: "50+",            label: t("stat_pcs_label") },
                { value: "200+",           label: t("stat_games_label") },
                { value: "24/7",           label: t("stat_access_label") },
                { value: t("stat_tourney_val"), label: t("stat_tourney_label") },
              ].map((s) => (
                <div key={s.label} className="bg-background px-5 py-4">
                  <div className="font-display text-2xl font-black text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── ZONES ────────────────────────────────────────────── */}
      <Section id="zones" num="01" title={t("title_zones")}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonesQ.data?.map((z, i) => (
            <motion.div key={z.id} variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            >
              <Card className="glass-card card-hover overflow-hidden h-full flex flex-col p-0">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {z.imageUrl && <img src={z.imageUrl} alt={z.name} className="w-full h-full object-cover opacity-75" loading="lazy" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
                  <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded border ${TIER_COLORS[z.tier]}`}>{z.tier}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-base text-foreground mb-1">{z.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">{z.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xl font-bold text-foreground">{formatPrice(z.hourlyRate)}</span>
                      <span className="text-xs text-muted-foreground ml-1">{t("per_hour")}</span>
                    </div>
                    <a href="#seatmap">
                      <Button size="sm" variant="ghost" className="text-primary text-xs px-2 hover:bg-primary/10">
                        {t("view_seats")} <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── PACKAGES ─────────────────────────────────────────── */}
      <Section id="packages" num="02" title={t("title_packages")}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pkgQ.data?.map((p, i) => (
            <motion.div key={p.id} variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            >
              <Card className="glass-card card-hover h-full p-5 flex flex-col border-t-2" style={{ borderTopColor: "var(--color-primary)" }}>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">{p.category}</div>
                <h3 className="font-semibold text-foreground text-base">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4 flex-1 min-h-[2.5rem]">{p.description}</p>
                <div className="text-3xl font-bold text-foreground">{formatPrice(p.price)}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1 mb-4">
                  {p.durationMinutes} {t("min_word")} · <span className="text-primary">+{p.xpReward} XP</span>
                </div>
                <Link to="/auth">
                  <Button variant="outline" className="w-full text-sm border-border hover:border-primary/50 hover:text-primary">
                    {t("select_btn")}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── SEAT MAP ─────────────────────────────────────────── */}
      <Section id="seatmap" num="03" title={t("title_seatmap")}>
        <p className="text-sm text-muted-foreground mb-6 flex items-center flex-wrap gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{t("seatmap_available")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{t("seatmap_occupied")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{t("seatmap_vip")}</span>
        </p>
        <div className="space-y-4">
          {zonesQ.data?.map((z) => {
            const seats = (wsQ.data ?? []).filter((w) => w.zoneId === z.id);
            const avail = seats.filter((s) => !occupied.has(s.id)).length;
            return (
              <Card key={z.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${TIER_COLORS[z.tier]}`}>{z.tier}</span>
                    <span className="font-semibold text-sm text-foreground">{z.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {t("available_word")} <strong className="text-foreground">{avail}</strong> / {seats.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {seats.map((s) => {
                    const isOcc = occupied.has(s.id);
                    const isVip = z.tier === "VIP";
                    const cls   = isOcc
                      ? "border-red-500/40 text-red-400 bg-red-500/8"
                      : isVip
                        ? "border-amber-400/50 text-amber-300 bg-amber-400/8"
                        : "border-emerald-500/40 text-emerald-400 bg-emerald-500/8";
                    return (
                      <Link key={s.id} to="/auth"
                        className={`px-2.5 py-1.5 border rounded text-xs font-mono transition hover:opacity-80 ${cls}`}>
                        {s.name}
                      </Link>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ── TOURNAMENTS ──────────────────────────────────────── */}
      <Section id="tournaments" num="04" title={t("title_upcoming_tour")}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tQ.data?.map((tn, i) => (
            <motion.div key={tn.id} variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            >
              <Card className="glass-card card-hover overflow-hidden flex flex-col p-0">
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider">{tn.game}</span>
                    <Badge variant="outline" className={`text-[10px] ${tn.status === "Registration Open" ? "border-emerald-500/40 text-emerald-400" : "border-border text-muted-foreground"}`}>
                      {tn.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground text-base mb-3">{tn.name}</h3>
                  <div className="text-2xl font-bold text-amber-400 mb-1">{formatPrice(tn.prizePool)}</div>
                  <div className="text-xs text-muted-foreground mb-3">{t("prize_pool")}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Users className="w-3 h-3" />
                    {tn.currentParticipants} / {tn.maxParticipants}
                  </div>
                  <Progress value={(tn.currentParticipants / Math.max(1, tn.maxParticipants)) * 100} className="h-0.5 mb-3" />
                  <div className="text-xs text-muted-foreground mb-4">
                    {t("start_lbl")}: {tn.startTime ? new Date(tn.startTime).toLocaleString() : "—"}
                  </div>
                  <Link to="/auth" className="mt-auto">
                    <Button size="sm" className="w-full bg-primary text-primary-foreground font-medium">
                      {t("register_btn")}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── GALLERY ──────────────────────────────────────────── */}
      <Section id="gallery" num="05" title={t("title_gallery")}>
        <div className="flex gap-2 flex-wrap mb-6">
          {galleryCats.map((c) => (
            <button
              key={c}
              onClick={() => setGalleryFilter(c)}
              className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                galleryFilter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c === "All" ? t("all_filter") : c}
            </button>
          ))}
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
          {galleryItems.map((g, idx) => (
            <motion.div
              key={g.id}
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true }} transition={{ delay: idx * 0.04 }}
              className="relative break-inside-avoid overflow-hidden rounded border border-border group cursor-zoom-in"
              onClick={() => openLightbox(idx)}
            >
              {/* Image with error fallback */}
              <img
                src={g.imageUrl}
                alt={g.title}
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
                }}
              />

              {/* Zoom icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="text-sm font-medium text-white">{g.title}</div>
                <div className="text-xs text-white/60">{g.category}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── REVIEWS ──────────────────────────────────────────── */}
      <Section id="reviews" num="06" title={t("title_reviews")}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map((r, i) => (
            <Card key={i} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
                  {r.name.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="text-amber-400 text-xs leading-none mt-0.5">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{r.text}"</p>
            </Card>
          ))}
        </div>
      </Section>

    </main>
    </>
  );
}

/* ── Section wrapper ────────────────────────────────────────── */
function Section({ id, num, title, children }: {
  id?: string; num: string; title: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="container mx-auto px-4 py-20">
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="show"
        viewport={{ once: true }}
        className="mb-10 flex items-baseline gap-4 border-b border-border pb-4"
      >
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{num}</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
      </motion.div>
      {children}
    </section>
  );
}
