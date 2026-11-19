import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { resolveMenu } from "@/lib/site-structure";
import { NavLinks } from "./NavLinks";
import { Logo } from "./Logo";
import { SeasonBanner } from "./SeasonBanner";
import { activeSeason, seasonEmoji } from "@/lib/seasons";

export function Header({ s }: { s: SiteSettings }) {
  // a holiday banner takes the place of the usual announcement while it's on
  const season = activeSeason(s.seasons);
  return (
    <>
      {season ? <SeasonBanner season={season} emoji={seasonEmoji(season)} /> : s.announcement ? <div className="announce">{s.announcement}</div> : null}
      <header className="band">
        <div className="band-inner">
          <Link href="/" className="brand">
            <Logo s={s} size={54} />
            <span className="brand-name">{s.businessName}</span>
          </Link>
          <NavLinks links={resolveMenu(s).filter((m) => m.top && !m.off).map((m) => ({ href: m.href, label: m.label }))} />
        </div>
      </header>
      {!s.storeOpen ? <div className="closed-note">{s.closedMessage}</div> : null}
    </>
  );
}
