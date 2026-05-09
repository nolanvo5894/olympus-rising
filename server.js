import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.GEMINI_API_KEY;

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-3-pro-image-preview";

let _client = null;
function client() {
  if (!API_KEY) {
    const err = new Error("GEMINI_API_KEY is not set on the server.");
    err.status = 503;
    throw err;
  }
  if (!_client) _client = new GoogleGenAI({ apiKey: API_KEY });
  return _client;
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(API_KEY) });
});

app.post("/api/gemini-text", async (req, res) => {
  try {
    const { promptOrParts, schema } = req.body ?? {};
    if (promptOrParts == null) {
      return res.status(400).json({ error: "promptOrParts is required" });
    }
    const config = schema
      ? { responseMimeType: "application/json", responseSchema: schema }
      : undefined;
    const contents = Array.isArray(promptOrParts)
      ? [{ role: "user", parts: promptOrParts }]
      : promptOrParts;
    const r = await client().models.generateContent({
      model: TEXT_MODEL,
      contents,
      config,
    });
    res.json({ text: r.text ?? "" });
  } catch (e) {
    console.error("[gemini-text]", e);
    res.status(e.status || 500).json({ error: e.message || "internal" });
  }
});

app.post("/api/gemini-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "2:3" } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "prompt is required" });
    const r = await client().models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: { imageConfig: { aspectRatio } },
    });
    const parts = r.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if (p.inlineData?.data) {
        const mime = p.inlineData.mimeType || "image/png";
        return res.json({ dataUrl: `data:${mime};base64,${p.inlineData.data}` });
      }
    }
    res.status(502).json({ error: "Gemini image response contained no image data." });
  } catch (e) {
    console.error("[gemini-image]", e);
    res.status(e.status || 500).json({ error: e.message || "internal" });
  }
});

const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir, { index: false }));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`olympus-rising listening on :${PORT} (gemini key: ${API_KEY ? "set" : "MISSING"})`);
});
