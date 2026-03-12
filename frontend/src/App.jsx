import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ChatInput from "./components/ChatInput.jsx";

// Backend URL (use VITE_API_BASE_URL to override in production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const seedMessage = {
  id: crypto.randomUUID(),
  role: "assistant",
  content:
    "Hi! I\"m your AI tutor. Ask me anything and I\"ll explain it step-by-step with examples.",
  createdAt: new Date().toISOString(),
  canCopy: false
};

export default function App() {
  const [messages, setMessages] = useState([seedMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [useStreaming, setUseStreaming] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("ai-tutor-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const chatEndRef = useRef(null); // Auto-scroll anchor

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("ai-tutor-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_BASE_URL}/api/models`)
      .then(({ data }) => {
        if (!active) return;
        const list = data?.models || [];
        setModels(list);
        setSelectedModel(data?.defaultModel || list[0] || "");
      })
      .catch(() => {
        if (!active) return;
        setModels([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const appendAssistantChunk = (assistantId, delta) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantId ? { ...msg, content: `${msg.content}${delta}` } : msg
      )
    );
  };

  const replaceAssistantMessage = (assistantId, content) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === assistantId ? { ...msg, content } : msg))
    );
  };

  const sendNonStreaming = async (text, assistantId) => {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      message: text,
      model: selectedModel || undefined
    });

    const reply = response?.data?.reply || "I couldn't generate a response.";
    if (assistantId) {
      replaceAssistantMessage(assistantId, reply);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    let assistantId = "";

    try {
      if (useStreaming) {
        assistantId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString()
          }
        ]);

        const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            model: selectedModel || undefined
          })
        });

        if (!response.ok || !response.body) {
          throw new Error("Streaming failed.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              try {
                const payload = JSON.parse(part.replace("data: ", ""));
                if (payload.delta) {
                  appendAssistantChunk(assistantId, payload.delta);
                }
              } catch {
                // Ignore malformed chunks
              }
            }
          }
        }
      } else {
        await sendNonStreaming(trimmed);
      }
    } catch (err) {
      setError("We couldn't reach the AI tutor. Please try again.");
      if (assistantId) {
        replaceAssistantMessage(
          assistantId,
          "Sorry, something went wrong while generating the response. Try again in a moment."
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Sorry, something went wrong while generating the response. Try again in a moment.",
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const headerStats = useMemo(() => {
    const userCount = messages.filter((m) => m.role === "user").length;
    return `${userCount} questions asked`;
  }, [messages]);

  const handleClear = () => {
    setMessages([seedMessage]);
    setError("");
  };

  const handleDownload = () => {
    const body = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-tutor-chat.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-12 pt-6 sm:px-6">
        <section className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/5 dark:bg-night-800/70">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-500">
              Personal AI Tutor
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              Ask better questions. Learn faster.
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Get clear, step-by-step explanations and examples. Ideal for math, programming,
              science, and study support.
            </p>
            <span className="text-sm text-slate-500 dark:text-slate-400">{headerStats}</span>
          </div>
        </section>

        <section className="flex flex-1 flex-col rounded-3xl border border-white/60 bg-white/80 shadow-soft backdrop-blur dark:border-white/5 dark:bg-night-800/70">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 text-sm text-slate-600 dark:border-slate-700/70 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Model
              </span>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                disabled={!models.length || loading}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition focus:outline-none dark:border-slate-600 dark:bg-night-700 dark:text-slate-100"
              >
                {models.length ? (
                  models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                ) : (
                  <option value="">Default</option>
                )}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-night-700 dark:text-slate-100">
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(event) => setUseStreaming(event.target.checked)}
                />
                Streaming
              </label>
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-600 dark:bg-night-700 dark:text-slate-100"
              >
                Download
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-600 dark:bg-night-700 dark:text-slate-100"
              >
                Clear chat
              </button>
            </div>
          </div>
          <ChatWindow
            messages={messages}
            loading={loading}
            isDark={isDark}
            chatEndRef={chatEndRef}
            onCopy={handleCopy}
            copiedId={copiedId}
          />
          <div className="border-t border-slate-200/70 px-4 py-4 dark:border-slate-700/70">
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            ) : null}
            <ChatInput onSend={handleSend} loading={loading} />
          </div>
        </section>
      </main>
    </div>
  );
}
