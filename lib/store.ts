import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { Redis } from "@upstash/redis";
import { ensureSupabase, supabase, supabaseConfigured, TABLE } from "./supabase";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny key/value layer. Picks the first one that's set up:
 * 1. Supabase (default): SUPABASE_URL + SUPABASE_SECRET_KEY, added by Vercel's Supabase integration.
 * 2. Upstash Redis (optional alternative): KV_REST_API_URL / KV_REST_API_TOKEN.
 * 3. Neither (your own computer): saves to .data/db.json so you can try everything.
 */
interface KV {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  hincrby(key: string, field: string, by: number): Promise<void>;
  hgetall(key: string): Promise<Record<string, number>>;
  /** Takes a short-lived lock; false if someone else holds it. */
  claim(key: string, ttlMs: number): Promise<boolean>;
  release(key: string): Promise<void>;
}

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const PREFIX = "shop:";

export const storageMode: "supabase" | "redis" | "file" = supabaseConfigured() ? "supabase" : url && token ? "redis" : "file";

function supabaseKV(): KV {
  const sb = () => ensureSupabase().then(() => supabase());
  return {
    async get<T>(k: string) {
      const { data, error } = await (await sb()).from(TABLE).select("value").eq("key", k).maybeSingle();
      if (error) throw new Error(error.message);
      return ((data?.value as T) ?? null) as T | null;
    },
    async set<T>(k: string, v: T) {
      const { error } = await (await sb()).from(TABLE).upsert({ key: k, value: v as unknown, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
    },
    async hincrby(k, f, by) {
      const { error } = await (await sb()).rpc("shop_hincrby", { p_key: k, p_field: f, p_by: by });
      if (error) throw new Error(error.message);
    },
    async hgetall(k) {
      const { data, error } = await (await sb()).from(TABLE).select("value").eq("key", k).maybeSingle();
      if (error) throw new Error(error.message);
      return Object.fromEntries(Object.entries((data?.value as Record<string, unknown>) ?? {}).map(([a, b]) => [a, Number(b)]));
    },
    // a lock is a row that only one request can insert (the key is unique)
    async claim(k, ttl) {
      const db = await sb();
      const lk = `lock:${k}`;
      for (let tries = 0; tries < 2; tries++) {
        const { error } = await db.from(TABLE).insert({ key: lk, value: { until: Date.now() + ttl }, updated_at: new Date().toISOString() });
        if (!error) return true;
        if (error.code !== "23505") throw new Error(error.message);
        // held: take it over only if it has expired (its holder crashed)
        const { data } = await db.from(TABLE).select("value, updated_at").eq("key", lk).maybeSingle();
        const until = Number((data?.value as { until?: number } | null)?.until ?? 0);
        if (!data || until > Date.now()) return false;
        await db.from(TABLE).delete().eq("key", lk).eq("updated_at", data.updated_at);
      }
      return false;
    },
    async release(k) {
      await (await sb()).from(TABLE).delete().eq("key", `lock:${k}`);
    },
  };
}

function redisKV(): KV {
  const r = new Redis({ url: url!, token: token! });
  return {
    async get<T>(k: string) {
      return ((await r.get<T>(PREFIX + k)) ?? null) as T | null;
    },
    async set<T>(k: string, v: T) {
      await r.set(PREFIX + k, v);
    },
    async hincrby(k, f, by) {
      await r.hincrby(PREFIX + k, f, by);
    },
    async hgetall(k) {
      const res = (await r.hgetall<Record<string, number | string>>(PREFIX + k)) ?? {};
      return Object.fromEntries(Object.entries(res).map(([a, b]) => [a, Number(b)]));
    },
    async claim(k, ttl) {
      return (await r.set(`${PREFIX}lock:${k}`, 1, { nx: true, px: ttl })) === "OK";
    },
    async release(k) {
      await r.del(`${PREFIX}lock:${k}`);
    },
  };
}

function fileKV(): KV {
  // On Vercel the app folder is read-only, so before a database is connected we
  // keep data in /tmp. It works for a first look but is wiped regularly.
  const dir = process.env.VERCEL ? "/tmp/shop-data" : path.join(process.cwd(), ".data");
  const file = path.join(dir, "db.json");
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<Record<string, unknown>> {
    for (let tries = 0; tries < 3; tries++) {
      let raw: string;
      try {
        raw = await fs.readFile(file, "utf8");
      } catch {
        return {}; // no file yet
      }
      try {
        return JSON.parse(raw);
      } catch {
        await new Promise((r) => setTimeout(r, 20)); // caught mid-write somewhere else: read again
      }
    }
    throw new Error("The data file couldn't be read.");
  }
  async function save(db: Record<string, unknown>) {
    await fs.mkdir(dir, { recursive: true });
    // write a new file, then swap it in: anyone reading always sees a whole file, never half of one
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, file);
  }
  // serialize writes so concurrent requests don't clobber each other
  function locked<T>(fn: () => Promise<T>): Promise<T> {
    const next = queue.then(fn, fn);
    queue = next.catch(() => undefined);
    return next;
  }
  return {
    async get<T>(k: string) {
      const db = await load();
      return (db[k] as T) ?? null;
    },
    set: (k, v) =>
      locked(async () => {
        const db = await load();
        db[k] = v;
        await save(db);
      }),
    hincrby: (k, f, by) =>
      locked(async () => {
        const db = await load();
        const h = (db[k] as Record<string, number>) ?? {};
        h[f] = (h[f] ?? 0) + by;
        db[k] = h;
        await save(db);
      }),
    async hgetall(k) {
      const db = await load();
      return (db[k] as Record<string, number>) ?? {};
    },
    // one server process uses the file, so an in-memory lock is enough
    async claim(k, ttl) {
      const until = held.get(k);
      if (until && until > Date.now()) return false;
      held.set(k, Date.now() + ttl);
      return true;
    },
    async release(k) {
      held.delete(k);
    },
  };
}
const held = new Map<string, number>();

export const kv: KV = storageMode === "supabase" ? supabaseKV() : storageMode === "redis" ? redisKV() : fileKV();

// ---------- locks: one change at a time ----------

const holding = new AsyncLocalStorage<Set<string>>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs fn while holding the named lock, so two requests can't both read a list,
 * change it and save it (and lose one of the changes). Works across servers
 * (Supabase or Redis). Re-entrant: code that already holds the lock just runs.
 * If the lock can't be had within `wait`, it runs anyway rather than failing.
 */
export async function withLock<T>(name: string, fn: () => Promise<T>, opts: { ttl?: number; wait?: number } = {}): Promise<T> {
  const mine = holding.getStore();
  if (mine?.has(name)) return fn();
  const ttl = opts.ttl ?? 20_000;
  const until = Date.now() + (opts.wait ?? 15_000);
  let got = false;
  for (let i = 0; Date.now() < until; i++) {
    got = await kv.claim(name, ttl).catch(() => false);
    if (got) break;
    await sleep(Math.min(250, 25 + i * 15) + Math.random() * 25);
  }
  if (!got) console.error(`lock "${name}" busy for too long; going ahead`);
  try {
    return await holding.run(new Set([...(mine ?? []), name]), fn);
  } finally {
    if (got) await kv.release(name).catch(() => {});
  }
}

/** For changes to the shop's saved data: one at a time, shop-wide. */
export const mutate = <T>(fn: () => Promise<T>) => withLock("write", fn);

/** Wraps an API route handler so its reads and writes happen as one step. */
export function mutating<A extends unknown[], R>(handler: (...args: A) => Promise<R>) {
  return (...args: A) => mutate(() => handler(...args));
}
