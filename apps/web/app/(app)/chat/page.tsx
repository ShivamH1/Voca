"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadResult, askQuestion } from "@/lib/api";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: boolean;
}

const SUGGESTED = [
  "What are the main action items from this meeting?",
  "Who was responsible for which tasks?",
  "What key decisions were made?",
  "Are there any unresolved questions?",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const result = loadResult();
    if (!result) {
      router.replace("/upload");
      return;
    }
    setMeetingTitle(result.title);
    setMeetingId(result.meeting_id);
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (question: string) => {
    if (!question.trim() || isLoading) return;
    const q = question.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "", thinking: true },
    ]);
    setIsLoading(true);

    try {
      const { answer } = await askQuestion(q, meetingId);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: answer,
          thinking: false,
        };
        return next;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `Error: ${msg}`,
          thinking: false,
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  if (!meetingTitle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex gap-xs">
          {["-0.3s", "-0.15s", "0s"].map((d) => (
            <span
              key={d}
              className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
              style={{ animationDelay: d }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] relative bg-canvas">
      {/* Chat header */}
      <header className="flex items-center justify-between px-xxl py-md border-b border-hairline-strong bg-canvas/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-md">
          <Link
            href="/results"
            className="text-mute hover:text-primary transition-colors"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              arrow_back
            </span>
          </Link>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Ask Voca
            </h2>
            <p className="text-caption text-mute">{meetingTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-xl">
          <span className="text-caption text-mute px-sm py-xxs border border-hairline rounded bg-surface-container-low uppercase tracking-widest">
            Live Context
          </span>
          <button
            onClick={() => {
              const lines = messages
                .map(
                  (m) => `${m.role === "user" ? "You" : "Voca"}: ${m.content}`,
                )
                .join("\n\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(
                new Blob([lines], { type: "text/plain" }),
              );
              a.download = "voca_chat.txt";
              a.click();
            }}
            className="bg-primary text-on-primary px-lg py-xs rounded-lg text-button-sm font-button-sm hover:opacity-80 transition-opacity"
          >
            Export
          </button>
        </div>
      </header>

      {/* Messages area */}
      <section className="flex-1 overflow-y-auto px-xxl py-xl space-y-xl pb-48">
        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto pt-xl">
            <div className="text-center mb-xxl">
              <div className="w-12 h-12 rounded-full bg-surface-elevated border border-hairline-strong flex items-center justify-center mx-auto mb-lg">
                <span
                  className="material-symbols-outlined text-accent-blue"
                  style={{ fontSize: 24 }}
                >
                  auto_awesome
                </span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-primary mb-md">
                Ask me anything about this meeting
              </h3>
              <p className="text-body-sm text-mute">
                I have full access to the transcript and can answer questions
                about decisions, action items, participants, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left p-xl bg-surface-elevated border border-hairline hover:border-hairline-strong rounded-xl transition-all group"
                >
                  <p className="text-body-sm text-charcoal group-hover:text-primary transition-colors">
                    {q}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex max-w-4xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[70%] bg-surface-card border border-hairline-strong p-xl rounded-xl">
                <p className="text-body-md font-body-md text-primary">
                  {msg.content}
                </p>
              </div>
            ) : (
              <div className="max-w-[85%] bg-surface-elevated border border-hairline p-xl rounded-xl">
                <div className="flex items-center gap-sm mb-md text-accent-blue">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    auto_awesome
                  </span>
                  <span className="text-caption font-bold uppercase tracking-widest">
                    {msg.thinking
                      ? "Searching Knowledge Base..."
                      : "Voca Intelligence"}
                  </span>
                </div>
                {msg.thinking ? (
                  <div className="flex gap-xs">
                    {["-0.3s", "-0.15s", "0s"].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce"
                        style={{ animationDelay: d }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </section>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 right-0 lg:left-72 p-xxl z-40 bg-canvas/40 backdrop-blur-sm">
        <div className="absolute inset-x-0 bottom-0 h-64 glow-blue-bottom -z-10" />
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-blue/20 to-transparent rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
          <div className="relative bg-surface-elevated border border-hairline-strong rounded-xl p-md flex items-end gap-md shadow-2xl">
            <div className="flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKey}
                placeholder="Message Voca..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-body-md font-body-md text-primary placeholder:text-stone resize-none py-sm"
                style={{ maxHeight: 200 }}
              />
            </div>
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              className="bg-primary text-on-primary w-10 h-10 rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </div>
          <div className="flex justify-center mt-md gap-xl text-caption text-mute/50">
            <span>Enter to send · Shift+Enter for newline</span>
            <span>•</span>
            <span>Context: {meetingTitle}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
