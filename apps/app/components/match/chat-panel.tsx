"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useWebRTC, type ChatMessage } from "@/context/webrtc-context";
import { cn } from "@/lib/utils";

/** P2P chat panel shown alongside the video during a match. */
export function ChatPanel() {
  const { messages, sendMessage, chatReady, status } = useWebRTC();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMatched = status === "matched";

  return (
    <div className="liquid-glass flex h-full flex-col overflow-hidden rounded-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
        <span className="text-sm font-medium text-foreground">Chat</span>
        {chatReady && (
          <span className="size-2 rounded-full bg-emerald-400" />
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3"
      >
        {!isMatched ? (
          <p className="m-auto text-center text-xs text-muted-foreground">
            Chat will appear here once you are matched.
          </p>
        ) : messages.length === 0 ? (
          <p className="m-auto text-center text-xs text-muted-foreground">
            Say something to break the ice.
          </p>
        ) : (
          messages.map((msg) => <Bubble key={msg.id} message={msg} />)
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!chatReady}
            placeholder={chatReady ? "Type a message..." : "Waiting for connection..."}
            className="flex-1 rounded-full bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!chatReady || !input.trim()}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isYou = message.sender === "you";

  return (
    <div className={cn("flex", isYou ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isYou
            ? "rounded-br-md bg-foreground/15 text-foreground"
            : "rounded-bl-md bg-muted/60 text-foreground"
        )}
      >
        {message.text}
      </div>
    </div>
  );
}
