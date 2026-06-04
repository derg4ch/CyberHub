export const TIER_COLORS: Record<string, string> = {
  Standard: "text-sky-400 border-sky-400/40 bg-sky-400/10",
  Pro: "text-[#7B2FBE] border-[#7B2FBE]/40 bg-[#7B2FBE]/10",
  VIP: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  Streaming: "text-primary border-primary/40 bg-primary/10",
  VR: "text-[#FF0066] border-[#FF0066]/40 bg-[#FF0066]/10",
};

export const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
  Confirmed: "bg-primary/20 text-primary border-primary/40",
  Active: "bg-green-400/20 text-green-300 border-green-400/40 animate-pulse-neon",
  Completed: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-destructive/20 text-destructive border-destructive/40",
  "No-Show": "bg-destructive/20 text-destructive border-destructive/40",
};

export function levelTitle(level: number) {
  if (level >= 11) return "LEGEND";
  if (level >= 7) return "ELITE";
  if (level >= 4) return "PRO";
  if (level >= 2) return "REGULAR";
  return "NEWBIE";
}

export function formatPrice(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return `$${v.toFixed(2)}`;
}
