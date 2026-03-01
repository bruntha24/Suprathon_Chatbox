import { Plus, Smile, SendHorizontal } from "lucide-react";
import { useState } from "react";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const hasText = value.trim().length > 0;

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted">
          <Plus size={18} className="text-foreground" />
        </button>
        <input
          type="text"
          placeholder="Write a message…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
        />
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted">
          <Smile size={18} className="text-muted-foreground" />
        </button>
        <button
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            hasText ? "bg-primary" : "bg-chat-icon"
          }`}
        >
          <SendHorizontal size={18} className={hasText ? "text-primary-foreground" : "text-muted-foreground"} />
        </button>
      </div>
      <p className="mt-2.5 text-center text-[11px] text-muted-foreground">Powered by text</p>
    </div>
  );
};

export default ChatInput;
