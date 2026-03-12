import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

function parseContent(raw) {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: raw.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "text", content: match[2].trimEnd() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < raw.length) {
    parts.push({ type: "text", content: raw.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "text", content: raw }];
}

function formatPlainText(text) {
  return text
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1");
}

export default function MessageContent({ content, isDark, isUser }) {
  const parts = parseContent(content);

  return (
    <div className={`space-y-3 ${isUser ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <SyntaxHighlighter
              key={`code-${index}`}
              language={part.lang}
              style={isDark ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                borderRadius: "16px",
                padding: "16px",
                fontSize: "0.85rem"
              }}
            >
              {part.content}
            </SyntaxHighlighter>
          );
        }

        return (
          <p key={`text-${index}`} className="whitespace-pre-wrap leading-relaxed">
            {formatPlainText(part.content)}
          </p>
        );
      })}
    </div>
  );
}
