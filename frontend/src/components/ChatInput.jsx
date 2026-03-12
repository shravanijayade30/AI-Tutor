import { useState } from "react";

export default function ChatInput({ onSend, loading }) {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Ask a question
        </label>
        <textarea
          rows={3}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Explain binary search with an example..."
          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-night-700 dark:text-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
