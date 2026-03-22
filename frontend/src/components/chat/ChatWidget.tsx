"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowUp, X, ArrowLeft, Maximize2, MoreHorizontal, Bot as BotIcon, SendHorizontal } from "lucide-react";

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
  timestamp: Date;
}

// Format time as HH:MM
const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Auto link renderer
const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-80 transition break-all">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

// Bot avatar
const BotAvatar = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
    <BotIcon size={14} className="text-primary-foreground" />
  </div>
);

// Animated typing indicator dots
const TypingIndicator = () => (
  <div className="flex gap-2 items-start">
    <BotAvatar />
    <div
      className="bg-chat-bot p-3 rounded-chat"
      style={{ borderRadius: "18px 18px 18px 4px" }}
    >
      <div className="flex items-center gap-1 h-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-2 w-2 rounded-full bg-muted-foreground"
            style={{
              animation: "typing-bounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: "bot", text: "Hi! I'm your AI Assistant. Ask me anything!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea based on content
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollTop + clientHeight < scrollHeight - 50);
  };

  const scrollToBottom = () =>
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { id: Date.now(), type: "user", text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await axios.post("http://localhost:8000/api/chat", { message: trimmed });
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "bot", text: res.data.reply || "Sorry, no answer.", timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "bot", text: "Oops! Something went wrong. Try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <>
      {/* Inline CSS for typing animation */}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .chat-bubble-text {
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .chat-textarea {
          resize: none;
          overflow-y: auto;
          min-height: 36px;
          max-height: 120px;
          line-height: 1.5;
        }
        .chat-textarea::-webkit-scrollbar { width: 4px; }
        .chat-textarea::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground)/0.3); border-radius: 4px; }
      `}</style>

      {/* Launcher button */}
      {!open && (
        <div onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            💬
          </div>
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <div
            className="relative w-[440px] flex flex-col rounded-[24px] bg-background shadow-xl overflow-hidden"
            style={{ height: "min(90vh, 680px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted">
                  <ArrowLeft size={18} className="text-foreground" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted">
                  <Maximize2 size={16} className="text-foreground" />
                </button>
              </div>
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted">
                  <MoreHorizontal size={18} className="text-foreground" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon transition-colors hover:bg-muted"
                >
                  <X size={18} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-3 min-h-0"
            >
              {messages.map((msg) =>
                msg.type === "bot" ? (
                  // Bot: avatar (28px) + gap (8px) = 36px consumed; bubble wraps up to 70% of the full row width
                  <div key={msg.id} className="flex gap-2 items-start w-full">
                    <BotAvatar />
                    <div
                      className="flex flex-col gap-0.5 min-w-0"
                      style={{ maxWidth: "70%" }}
                    >
                      <div
                        className="bg-chat-bot p-3 text-sm chat-bubble-text break-words"
                        style={{ borderRadius: "18px 18px 18px 4px" }}
                      >
                        {renderMessageWithLinks(msg.text)}
                      </div>
                      <span className="text-muted-foreground text-[11px] px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ) : (
                  // User: right-aligned, bubble constrained to 70% of the scroll container
                  <div key={msg.id} className="flex flex-col items-end w-full">
                    <div
                      className="bg-chat-user text-primary-foreground p-3 text-sm chat-bubble-text break-words"
                      style={{ borderRadius: "18px 18px 4px 18px", maxWidth: "70%", minWidth: 0 }}
                    >
                      {renderMessageWithLinks(msg.text)}
                    </div>
                    <span className="text-muted-foreground text-[11px] px-1 mt-0.5">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )
              )}

              {/* Typing indicator */}
              {loading && <TypingIndicator />}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="flex items-end gap-2 p-3 border-t border-border shrink-0">
              <textarea
                ref={textareaRef}
                placeholder="Write a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="chat-textarea flex-1 rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
              <button
                onClick={sendMessage}
                disabled={!hasText || loading}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                  hasText && !loading
                    ? "bg-primary hover:bg-primary/90 shadow-sm"
                    : "bg-muted cursor-not-allowed"
                }`}
                title="Send message"
              >
                <SendHorizontal
                  size={16}
                  className={hasText && !loading ? "text-primary-foreground" : "text-muted-foreground"}
                />
              </button>
            </div>

            {/* Powered by */}
            <p className="text-center text-[11px] text-muted-foreground pb-2 shrink-0">
              Powered by text
            </p>

            {/* Scroll to bottom button */}
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute right-4 bottom-24 bg-primary h-8 w-8 rounded-full text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                <ArrowUp size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;