"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ArrowUp,
  X,
  ArrowLeft,
  Maximize2,
  MoreHorizontal,
  Bot as BotIcon,
} from "lucide-react";

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
  status?: string;
}

// ✅ Auto Link Renderer
const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:opacity-80 transition"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Bot Avatar Component
const BotAvatar = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
    <BotIcon size={14} className="text-primary-foreground" />
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text:
        "Hi there! I'm your AI Assistant, here to guide and support you throughout the Hackathon. Feel free to ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollTop + clientHeight < scrollHeight - 50);
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: userMessage.text,
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        text: res.data.reply || "No response from bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: "Oops! Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center cursor-pointer transition-all duration-500 animate-bounce-in"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground shadow-lg hover:scale-110 transition-transform duration-200">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#f9a8d4" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="url(#sparkle-grad)"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in-backdrop">
          <div
            className="relative flex w-[440px] flex-col rounded-[24px] bg-background chat-shadow transform transition-transform duration-300 animate-chat-open"
            style={{ height: "min(90vh, 680px)" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background border-b border-gray-200 rounded-t-[24px]">
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon hover:bg-muted">
                  <ArrowLeft size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon hover:bg-muted">
                  <Maximize2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon hover:bg-muted">
                  <MoreHorizontal size={18} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-icon hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 px-4 pt-4 pb-2 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent"
            >
              {messages.map((msg) =>
                msg.type === "bot" ? (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <BotAvatar />
                    <div className="max-w-[75%] break-words rounded-chat bg-chat-bot px-4 py-3 text-sm leading-relaxed text-foreground">
                      {renderMessageWithLinks(msg.text)}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="max-w-[75%] break-words rounded-chat bg-chat-user px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                      {renderMessageWithLinks(msg.text)}
                    </div>
                    {msg.status && (
                      <span className="mt-1 mr-1 text-[11px] text-muted-foreground">
                        {msg.status}
                      </span>
                    )}
                  </div>
                )
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex p-3 gap-2 border-t border-gray-200">
              <input
                type="text"
                placeholder="Write a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`px-4 py-2 rounded-full text-white transition ${
                  input.trim() ? "bg-primary" : "bg-gray-400"
                }`}
              >
                Send
              </button>
            </div>

            {/* Scroll Button */}
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute right-4 bottom-20 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;