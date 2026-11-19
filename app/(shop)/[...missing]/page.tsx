import { notFound } from "next/navigation";

// Any address the shop doesn't have shows the shop's own "Nothing here" page (with the menu), not a bare 404.
export default function Missing() {
  notFound();
}
