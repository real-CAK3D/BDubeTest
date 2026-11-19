import { LinkIcon, LINK_ICONS, linkHref } from "@/components/LinkIcon";
import type { LinkItem } from "@/lib/types";

/** The links with pictures (Words & logos > Contact page > Links). */
export function Social({ links }: { links: LinkItem[] }) {
  const shown = links.filter((l) => !l.hidden && l.url);
  if (!shown.length) return null;
  return (
    <ul className="social">
      {shown.map((l) => {
        const href = linkHref(l.icon, l.url);
        const outside = /^https?:/.test(href);
        return (
          <li key={l.id}>
            <a href={href} {...(outside ? { target: "_blank", rel: "noreferrer" } : {})}>
              <span className="social-ic"><LinkIcon icon={l.icon} size={18} /></span>
              {l.label || LINK_ICONS[l.icon]?.name || "Link"}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
