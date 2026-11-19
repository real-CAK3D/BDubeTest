/*
 * EDIT-POINT: AI-PROVIDERS
 * The AI services the chat can use. All but Anthropic speak the same
 * "OpenAI-style" language, so any service that offers an OpenAI-compatible
 * address works through "Other". To add one, copy a line: id, name, the
 * address (base URL), a model to start with and where to get a key.
 */
export type AiProvider = {
  id: string;
  name: string;
  baseUrl: string; // "" = Anthropic's own API
  model: string; // a sensible starting model; the owner can type another
  keyUrl: string;
  needsKey: boolean;
  note: string;
};

export const AI_PROVIDERS: AiProvider[] = [
  { id: "anthropic", name: "Anthropic (Claude)", baseUrl: "", model: "claude-opus-5-5", keyUrl: "https://console.anthropic.com/settings/keys", needsKey: true, note: "Pay as you go. Set a monthly limit in the Anthropic console. For cheaper replies, type a Haiku model instead." },
  { id: "openai", name: "OpenAI (ChatGPT)", baseUrl: "https://api.openai.com/v1", model: "gpt-6-luna", keyUrl: "https://platform.openai.com/api-keys", needsKey: true, note: "Pay as you go." },
  { id: "gemini", name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-3.5-flash-lite", keyUrl: "https://aistudio.google.com/apikey", needsKey: true, note: "Key from Google AI Studio. Check its pricing page for any free allowance." },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "openai/gpt-oss-20b", keyUrl: "https://console.groq.com/keys", needsKey: true, note: "Very fast and cheap." },
  { id: "openrouter", name: "OpenRouter (many models)", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-oss-20b", keyUrl: "https://openrouter.ai/keys", needsKey: true, note: "One key for hundreds of models; check its list for free ones." },
  { id: "ollama", name: "Ollama Cloud", baseUrl: "https://ollama.com/v1", model: "gpt-oss:20b", keyUrl: "https://ollama.com/settings/keys", needsKey: true, note: "Pay per use, no subscription needed." },
  { id: "ollama-own", name: "Ollama on your own computer (free)", baseUrl: "", model: "gemma4", keyUrl: "https://ollama.com/download", needsKey: false, note: "Free: the AI runs on your own computer. The website runs on Vercel, so your computer has to be on and reachable from the internet (for example with a free Cloudflare Tunnel). Type its address ending in /v1." },
  { id: "custom", name: "Other (OpenAI-compatible)", baseUrl: "", model: "", keyUrl: "", needsKey: false, note: "Any service with an OpenAI-compatible API: LM Studio, Together, Mistral, DeepSeek... Type its address (usually ending in /v1) and model name." },
];

export const providerOf = (id: string) => AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0];
