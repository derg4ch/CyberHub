import { Mail, Phone, MapPin, Twitch, Twitter, Instagram } from "lucide-react";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="font-display font-black text-lg text-primary mb-1">NEXUS</div>
          <div className="text-[11px] font-mono text-muted-foreground mb-3">CYBER LOUNGE</div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("footer_tagline")}</p>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">{t("footer_hours")}</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>{t("footer_hours_24")}</li>
            <li>{t("footer_hours_vip")}</li>
            <li>{t("footer_hours_tour")}</li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">{t("footer_contact")}</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2.5"><Phone    className="w-3.5 h-3.5 shrink-0" /> +380 (44) 000-00-00</li>
            <li className="flex items-center gap-2.5"><Mail     className="w-3.5 h-3.5 shrink-0" /> hq@nexus.gg</li>
            <li className="flex items-center gap-2.5"><MapPin   className="w-3.5 h-3.5 shrink-0" /> вул. Хрещатик, 1, Київ</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">{t("footer_connect")}</h4>
          <div className="flex gap-2">
            {[Twitch, Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#"
                className="w-8 h-8 flex items-center justify-center border border-border rounded hover:border-primary/40 hover:text-primary text-muted-foreground transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <p className="container mx-auto px-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} NEXUS Cyber Lounge — {t("footer_nominal")}
        </p>
      </div>
    </footer>
  );
}
