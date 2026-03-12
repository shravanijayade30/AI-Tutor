import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.GROQ_API_KEY) {
  console.warn("Missing GROQ_API_KEY in backend/.env");
}

// Groq client for Llama responses
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL_CATALOG = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant"
];
const DEFAULT_MODEL = MODEL_CATALOG[0];

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/models", (req, res) => {
  res.json({ models: MODEL_CATALOG, defaultModel: DEFAULT_MODEL });
});

// Main chat endpoint for the AI tutor
app.post("/api/chat", async (req, res) => {
  const { message, model } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY." });
  }

  const selectedModel = MODEL_CATALOG.includes(model) ? model : DEFAULT_MODEL;

  try {
    const completion = await groq.chat.completions.create({
      model: selectedModel,
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are an AI tutor. Explain concepts step-by-step, use simple language, and give examples."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: "No reply from Groq." });
    }

    return res.json({ reply });
  } catch (error) {
    const details = error?.response?.data || error?.message || "Unknown error";
    console.error("Groq API error:", details);
    return res.status(500).json({ error: "Failed to generate reply.", details });
  }
});

// Streaming chat endpoint (SSE)
app.post("/api/chat/stream", async (req, res) => {
  const { message, model } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY." });
  }

  const selectedModel = MODEL_CATALOG.includes(model) ? model : DEFAULT_MODEL;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await groq.chat.completions.create({
      model: selectedModel,
      temperature: 0.3,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are an AI tutor. Explain concepts step-by-step, use simple language, and give examples."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    res.write("event: done\ndata: {}\n\n");
    res.end();
  } catch (error) {
    const details = error?.response?.data || error?.message || "Unknown error";
    console.error("Groq stream error:", details);
    res.write(`event: error\ndata: ${JSON.stringify({ error: "Stream failed." })}\n\n`);
    res.end();
  }
});

// Serve frontend build only if it exists (local single-link setup).
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
const frontendIndex = path.join(frontendDist, "index.html");
if (fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));
  // Avoid catching API routes with the SPA fallback.
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(frontendIndex);
  });
}

app.listen(PORT, () => {
  console.log(`AI Tutor backend running on port ${PORT}`);
});
