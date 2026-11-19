import Link from "next/link";
import { LinkIcon } from "@/components/LinkIcon";
import type { LinkItem } from "@/lib/types";

/** One "Socials" button (with the first few icons) that opens the Socials page. */
export function Social({ links }: { links: LinkItem[] }) {
  const shown = links.filter((l) => !l.hidden && l.url);
  if (!shown.length) return null;
  return (
    <p className="socials-btn-wrap">
      <Link href="/socials" className="socials-btn">
        <span className="socials-icons" aria-hidden>
          {shown.slice(0, 4).map((l) => (
            <span key={l.id} className="social-ic"><LinkIcon icon={l.icon} size={16} /></span>
          ))}
        </span>
        Socials
      </Link>
    </p>
  );
}
