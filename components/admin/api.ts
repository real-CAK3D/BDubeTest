import { shrink } from "@/lib/shrink-image";
export async function api<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) window.location.href = "/admin/login";
  if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data as T;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const blob = await shrink(file);
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : file.name.split(".").pop();
  const form = new FormData();
  form.append("file", new File([blob], `upload.${ext}`, { type: blob.type || file.type }));
  form.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data.url;
}
