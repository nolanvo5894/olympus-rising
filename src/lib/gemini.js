// In production (Cloud Run): calls go through /api/gemini-* — the server
// holds GEMINI_API_KEY so it never reaches the browser.
//
// In Vite dev (`npm run dev`): we still call Gemini directly from the
// browser using VITE_GEMINI_API_KEY so the existing single-command dev
// loop keeps working. The README's warning about VITE_* keys still
// applies — only safe locally.

import { GoogleGenAI } from "@google/genai";

const DEV = import.meta.env.DEV;
const DEV_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const TEXT_MODEL = "gemini-2.5-flash";
export const IMAGE_MODEL = "gemini-3-pro-image-preview";

export class GeminiKeyMissingError extends Error {
  constructor() {
    super(
      DEV
        ? "VITE_GEMINI_API_KEY is not set. Add it to .env.local and restart `npm run dev`."
        : "GEMINI_API_KEY is not set on the server."
    );
    this.name = "GeminiKeyMissingError";
  }
}

let _devClient = null;
function devClient() {
  if (!DEV_KEY) throw new GeminiKeyMissingError();
  if (!_devClient) _devClient = new GoogleGenAI({ apiKey: DEV_KEY });
  return _devClient;
}

// Synchronous: callers use this as a boolean in JSX. In prod the server
// is the source of truth — if the key is missing, the proxy returns 503
// and `geminiText`/`geminiImage` throw `GeminiKeyMissingError`.
export function hasApiKey() {
  return DEV ? Boolean(DEV_KEY) : true;
}

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 503) throw new GeminiKeyMissingError();
    throw new Error(j.error || `HTTP ${r.status}`);
  }
  return j;
}

export async function geminiText(promptOrParts, schema) {
  if (DEV) {
    const config = schema
      ? { responseMimeType: "application/json", responseSchema: schema }
      : undefined;
    const contents = Array.isArray(promptOrParts)
      ? [{ role: "user", parts: promptOrParts }]
      : promptOrParts;
    const res = await devClient().models.generateContent({
      model: TEXT_MODEL,
      contents,
      config,
    });
    const text = res.text ?? "";
    if (!schema) return text;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
    }
  }

  const { text } = await postJSON("/api/gemini-text", { promptOrParts, schema });
  if (!schema) return text;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
  }
}

export async function geminiImage(prompt, { aspectRatio = "2:3" } = {}) {
  if (DEV) {
    const res = await devClient().models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: { imageConfig: { aspectRatio } },
    });
    const parts = res.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if (p.inlineData?.data) {
        const mime = p.inlineData.mimeType || "image/png";
        return `data:${mime};base64,${p.inlineData.data}`;
      }
    }
    throw new Error("Gemini image response contained no image data.");
  }

  const { dataUrl } = await postJSON("/api/gemini-image", { prompt, aspectRatio });
  return dataUrl;
}
