import MessageBubble from "./MessageBubble.jsx";
import LoadingDots from "./LoadingDots.jsx";

export default function ChatWindow({
  messages,
  loading,
  isDark,
  chatEndRef,
  onCopy,
  copiedId
}) {
  return (
    <div className="flex h-[420px] flex-col gap-4 overflow-y-auto px-4 py-6 sm:h-[500px]">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isDark={isDark}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      ))}
      {loading ? (
        <div className="flex w-full items-start">
          <div className="max-w-[75%] rounded-2xl bg-night-700 px-4 py-3 text-sm text-white shadow-sm dark:bg-night-700">
            <LoadingDots />
          </div>
        </div>
      ) : null}
      <div ref={chatEndRef} />
    </div>
  );
}
