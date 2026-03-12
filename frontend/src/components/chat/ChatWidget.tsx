"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ArrowUp, X, ArrowLeft, Maximize2, MoreHorizontal, Bot as BotIcon } from "lucide-react";

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
  status?: string;
}

// Auto link renderer
const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:opacity-80 transition">{part}</a>
    ) : part
  );
};

// Bot avatar
const BotAvatar = () => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
    <BotIcon size={14} className="text-primary-foreground" />
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, type: "bot", text: "Hi! I'm your AI Assistant. Ask me anything!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollTop + clientHeight < scrollHeight - 50);
  };

  const scrollToBottom = () => chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now(), type: "user", text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput(""); setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/chat", { message: userMessage.text });
      setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: res.data.reply || "Sorry, no answer." }]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: "Oops! Something went wrong. Try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {!open && <div onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 cursor-pointer"><div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center">💬</div></div>}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <div className="relative w-[440px] flex flex-col rounded-[24px] bg-background" style={{ height: "min(90vh,680px)" }}>
            <div className="sticky top-0 flex justify-between p-3 border-b border-gray-200 rounded-t-[24px]">
              <div className="flex gap-2">
                <button className="p-2 bg-chat-icon rounded-full"><ArrowLeft size={18} /></button>
                <button className="p-2 bg-chat-icon rounded-full"><Maximize2 size={16} /></button>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-chat-icon rounded-full"><MoreHorizontal size={18} /></button>
                <button onClick={() => setOpen(false)} className="p-2 bg-chat-icon rounded-full"><X size={18} /></button>
              </div>
            </div>

            <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map(msg => msg.type === "bot" ? (
                <div key={msg.id} className="flex gap-2 items-start">
                  <BotAvatar />
                  <div className="bg-chat-bot p-3 rounded-chat max-w-[75%]">{renderMessageWithLinks(msg.text)}</div>
                </div>
              ) : (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="bg-chat-user p-3 rounded-chat max-w-[75%]">{renderMessageWithLinks(msg.text)}</div>
                  {msg.status && <span className="text-muted-foreground text-[11px]">{msg.status}</span>}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 items-start animate-pulse">
                  <BotAvatar />
                  <div className="bg-chat-bot p-3 rounded-chat max-w-[75%]">Typing...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex p-3 gap-2 border-t border-gray-200">
              <input type="text" placeholder="Write a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1 border rounded-full p-2 outline-none"/>
              <button onClick={sendMessage} disabled={loading || !input.trim()} className={`px-4 py-2 rounded-full text-white ${input.trim() ? "bg-primary" : "bg-gray-400"}`}>Send</button>
            </div>

            {showScrollBtn && <button onClick={scrollToBottom} className="absolute right-4 bottom-20 bg-primary h-10 w-10 rounded-full text-white"><ArrowUp size={18} /></button>}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;