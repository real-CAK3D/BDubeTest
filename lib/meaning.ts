import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/*
 * EDIT-POINT: MEANING-MODEL
 * A small "meaning" model that lives inside the app: all-MiniLM-L6-v2
 * (Apache-2.0, about 23 MB, in /models/minilm). It turns a sentence into 384
 * numbers so that sentences meaning the same thing land close together:
 * "when will my stuff get here" ~ "how long does shipping take".
 * It never writes text, so it can't make anything up; the chat uses it only
 * to pick the right answer. Runs on the website's own server with the
 * WebAssembly build of ONNX Runtime: no key, no outside service, no cost.
 * If it can't load for any reason, the chat simply works without it.
 */

type Ort = typeof import("onnxruntime-web");
type Session = Awaited<ReturnType<Ort["InferenceSession"]["create"]>>;

const DIR = path.join(process.cwd(), "models", "minilm");
const MAX_TOKENS = 128;

let loading: Promise<{ ort: Ort; session: Session; vocab: Map<string, number> } | null> | null = null;
const cache = new Map<string, Float32Array>();

function load() {
  loading ??= (async () => {
    try {
      const ort = await import("onnxruntime-web");
      ort.env.wasm.numThreads = 1; // serverless functions: one thread, no workers
      ort.env.wasm.wasmPaths = path.join(process.cwd(), "node_modules", "onnxruntime-web", "dist") + path.sep;
      const [model, vocabText] = await Promise.all([readFile(path.join(DIR, "model_quantized.onnx")), readFile(path.join(DIR, "vocab.txt"), "utf8")]);
      const vocab = new Map(vocabText.split("\n").map((t, i) => [t.replace(/\r$/, ""), i] as const));
      const session = await ort.InferenceSession.create(new Uint8Array(model), { executionProviders: ["wasm"] });
      return { ort, session, vocab };
    } catch (e) {
      console.error("meaning model unavailable:", (e as Error).message);
      return null;
    }
  })();
  return loading;
}

// ---------- BERT WordPiece tokenizer (lowercase, accents removed) ----------

const isPunct = (ch: string) => {
  const c = ch.charCodeAt(0);
  return (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126) || /\p{P}/u.test(ch);
};

function basic(text: string) {
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[\u0000-\u001f\u007f�]/g, " ");
  const out: string[] = [];
  for (const word of clean.split(/\s+/)) {
    let cur = "";
    for (const ch of word) {
      if (isPunct(ch)) {
        if (cur) out.push(cur);
        out.push(ch);
        cur = "";
      } else cur += ch;
    }
    if (cur) out.push(cur);
  }
  return out;
}

function wordpiece(word: string, vocab: Map<string, number>) {
  if (word.length > 100) return [vocab.get("[UNK]")!];
  const ids: number[] = [];
  let start = 0;
  while (start < word.length) {
    let end = word.length;
    let found: number | undefined;
    while (start < end) {
      const piece = (start > 0 ? "##" : "") + word.slice(start, end);
      found = vocab.get(piece);
      if (found !== undefined) break;
      end--;
    }
    if (found === undefined) return [vocab.get("[UNK]")!];
    ids.push(found);
    start = end;
  }
  return ids;
}

function encode(text: string, vocab: Map<string, number>) {
  const ids = [vocab.get("[CLS]")!];
  for (const w of basic(text)) {
    ids.push(...wordpiece(w, vocab));
    if (ids.length >= MAX_TOKENS - 1) break;
  }
  ids.length = Math.min(ids.length, MAX_TOKENS - 1);
  ids.push(vocab.get("[SEP]")!);
  return ids;
}

// ---------- sentences to vectors ----------

/** One vector per text (length 384, unit length), or null if the model isn't available. */
export async function embed(texts: string[]): Promise<Float32Array[] | null> {
  const m = await load();
  if (!m) return null;
  const todo = [...new Set(texts.filter((t) => !cache.has(t)))];
  for (let i = 0; i < todo.length; i += 16) {
    const batch = todo.slice(i, i + 16);
    const enc = batch.map((t) => encode(t, m.vocab));
    const len = Math.max(...enc.map((e) => e.length));
    const n = batch.length;
    const ids = new BigInt64Array(n * len);
    const mask = new BigInt64Array(n * len);
    enc.forEach((e, r) => e.forEach((id, c) => ((ids[r * len + c] = BigInt(id)), (mask[r * len + c] = BigInt(1)))));
    const feeds: Record<string, InstanceType<Ort["Tensor"]>> = {
      input_ids: new m.ort.Tensor("int64", ids, [n, len]),
      attention_mask: new m.ort.Tensor("int64", mask, [n, len]),
    };
    if (m.session.inputNames.includes("token_type_ids")) feeds.token_type_ids = new m.ort.Tensor("int64", new BigInt64Array(n * len), [n, len]);
    const out = await m.session.run(feeds);
    const hidden = (out.last_hidden_state ?? out[m.session.outputNames[0]]).data as Float32Array;
    const dim = hidden.length / (n * len);
    enc.forEach((e, r) => {
      // average the word vectors (ignoring padding), then scale to length 1
      const v = new Float32Array(dim);
      for (let c = 0; c < e.length; c++) for (let d = 0; d < dim; d++) v[d] += hidden[(r * len + c) * dim + d];
      let norm = 0;
      for (let d = 0; d < dim; d++) norm += (v[d] /= e.length) ** 2;
      norm = Math.sqrt(norm) || 1;
      for (let d = 0; d < dim; d++) v[d] /= norm;
      if (cache.size > 3000) cache.delete(cache.keys().next().value!);
      cache.set(batch[r], v);
    });
  }
  return texts.map((t) => cache.get(t)!);
}

/** How alike two sentences are in meaning: about 0.2 unrelated, 0.5 related, 0.7+ the same question. */
export const similarity = (a: Float32Array, b: Float32Array) => a.reduce((n, x, i) => n + x * b[i], 0);

/** Starts loading the model early so the first customer doesn't wait. */
export const warmUp = () => void load();
