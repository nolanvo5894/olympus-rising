import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const TEXT_MODEL = "gemini-2.5-flash";
export const IMAGE_MODEL = "gemini-3-pro-image-preview";

export class GeminiKeyMissingError extends Error {
  constructor() {
    super("VITE_GEMINI_API_KEY is not set. Add it to .env.local and restart `npm run dev`.");
    this.name = "GeminiKeyMissingError";
  }
}

let _client = null;
function client() {
  if (!API_KEY) throw new GeminiKeyMissingError();
  if (!_client) _client = new GoogleGenAI({ apiKey: API_KEY });
  return _client;
}

export function hasApiKey() {
  return Boolean(API_KEY);
}

/**
 * Generate text. `promptOrParts` accepts either a string OR an array of
 * Gemini content parts: `[{text}, {inlineData: {mimeType, data}}, …]`.
 * Pass `schema` to force structured JSON output.
 */
export async function geminiText(promptOrParts, schema) {
  const config = schema
    ? { responseMimeType: "application/json", responseSchema: schema }
    : undefined;
  const contents = Array.isArray(promptOrParts)
    ? [{ role: "user", parts: promptOrParts }]
    : promptOrParts;
  const res = await client().models.generateContent({
    model: TEXT_MODEL,
    contents,
    config,
  });
  const text = res.text ?? "";
  if (!schema) return text;
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
  }
}

export async function geminiImage(prompt, { aspectRatio = "2:3" } = {}) {
  const res = await client().models.generateContent({
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
