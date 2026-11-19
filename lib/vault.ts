import "server-only";
import { getPrivate, setPrivate } from "./private-data";

/*
 * Saved logins for the services the shop uses (Stripe, Supabase, the bank,
 * a supplier...), kept encrypted with the rest of the private data and only
 * shown to a signed-in admin who taps "Show".
 */
export type VaultEntry = { id: string; service: string; url: string; username: string; password: string; note: string; updatedAt: string };

export const getVault = () => getPrivate<VaultEntry[]>("vault", []);
export const saveVault = (l: VaultEntry[]) => setPrivate("vault", l.slice(0, 200));
