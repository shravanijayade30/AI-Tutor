import MessageContent from "./MessageContent.jsx";

export default function MessageBubble({ message, isDark, onCopy, copiedId }) {
  const isUser = message.role === "user";
  const canCopy = message.canCopy !== false;
  const isCopied = copiedId === message.id;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:text-base ${
          isUser
            ? "bg-brand-500 text-white"
            : "bg-white text-slate-800 dark:bg-night-700 dark:text-slate-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <MessageContent content={message.content} isDark={isDark} isUser={isUser} />
          </div>
          {!isUser && onCopy && canCopy ? (
            <button
              type="button"
              onClick={() => onCopy(message.content, message.id)}
              className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-600 dark:bg-night-700 dark:text-slate-200"
            >
              {isCopied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
        {/* Timestamp removed per request */}
      </div>
    </div>
  );
}
