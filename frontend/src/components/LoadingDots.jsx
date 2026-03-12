export default function LoadingDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
      <span className="text-xs text-white/70">Thinking...</span>
    </div>
  );
}
