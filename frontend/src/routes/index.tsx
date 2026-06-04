import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CyberLanding } from "@/components/cyber-landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS // CYBER LOUNGE — Premier Cyberpunk Gaming Club" },
      { name: "description", content: "24/7 cyberpunk gaming lounge: RTX 4090 rigs, VR decks, esports arenas, tournaments. Book your seat at NEXUS." },
      { property: "og:title", content: "NEXUS // CYBER LOUNGE" },
      { property: "og:description", content: "Where pixels meet adrenaline. Premium PCs, VR, streaming studio, tournaments." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <SiteHeader />
      <CyberLanding />
      <SiteFooter />
    </>
  );
}
