export default function Navbar({ isDark, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur dark:border-white/5 dark:bg-night-800/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-lg font-semibold text-white shadow-glow">
            AT
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              AI Tutor
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-600 dark:bg-night-700 dark:text-slate-200"
          aria-label="Toggle dark mode"
        >
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </header>
  );
}
