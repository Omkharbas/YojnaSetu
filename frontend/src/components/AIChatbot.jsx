import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  RotateCcw,
  MessageCircle,
} from "lucide-react";

import { chatWithAI } from "../services/api";

export default function AIChatbot({ profile, analysis }) {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm YojnaSetu AI. Ask me about your schemes, eligibility, documents, conflicts, or application plan.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    const question = input.trim();

    if (!question || loading) return;

    setInput("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: question,
      },
    ]);

    setLoading(true);

    try {
      const result = await chatWithAI(
        question,
        profile,
        analysis
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            result?.reply ||
            "I couldn't generate an answer right now.",
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry 😕 I couldn't connect to YojnaSetu AI right now. Please make sure Ollama is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Fresh chat started ✨ Ask me anything about your benefit analysis.",
      },
    ]);
  };

  const quickQuestions = [
    "Why am I eligible?",
    "Missing documents?",
    "Which scheme first?",
  ];

  return (
    <>
      {/* FLOATING BUTTON */}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2.5 text-white shadow-xl transition hover:-translate-y-1 hover:bg-slate-900"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <Bot size={18} />

            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </span>

          <div className="hidden text-left sm:block">
            <p className="text-[11px] font-bold">
              Ask YojnaSetu AI
            </p>

            <p className="text-[9px] text-slate-400">
              Powered by Ollama
            </p>
          </div>
        </button>
      )}

      {/* CHAT WINDOW */}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

          {/* HEADER */}

          <div className="bg-slate-950 px-4 py-3 text-white">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">

                  <Bot size={18} />

                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />

                </div>

                <div>
                  <div className="flex items-center gap-1">

                    <p className="text-xs font-bold">
                      YojnaSetu AI
                    </p>

                    <Sparkles
                      size={11}
                      className="text-blue-400"
                    />

                  </div>

                  <p className="text-[9px] text-slate-400">
                    Llama 3.2 • Ollama
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-0.5">

                <button
                  onClick={resetChat}
                  title="New chat"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <RotateCcw size={13} />
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={15} />
                </button>

              </div>

            </div>

          </div>

          {/* MESSAGES */}

          <div className="flex h-[300px] flex-col gap-2 overflow-y-auto bg-slate-50 p-3">

            {messages.map((message, index) => {

              const isUser =
                message.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-5 ${
                      isUser
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >

                    {!isUser && (
                      <div className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-blue-600">
                        <Bot size={9} />
                        YojnaSetu AI
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">
                      {message.content}
                    </p>

                  </div>

                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">

                <div className="rounded-xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 shadow-sm">

                  <div className="flex items-center gap-2">

                    <Loader2
                      size={13}
                      className="animate-spin text-blue-600"
                    />

                    <span className="text-[10px] text-slate-500">
                      Thinking...
                    </span>

                  </div>

                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* QUICK QUESTIONS */}

          <div className="border-t border-slate-200 bg-white px-3 pt-2">

            <p className="mb-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
              Try asking
            </p>

            <div className="flex gap-1.5 overflow-x-auto pb-2">

              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setInput(question)}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {question}
                </button>
              ))}

            </div>

          </div>

          {/* INPUT */}

          <div className="border-t border-slate-200 bg-white p-3">

            <div className="flex items-end gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about your benefit plan..."
                className="max-h-16 min-h-[34px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={14} />
                )}
              </button>

            </div>

            <div className="mt-1.5 flex items-center justify-center gap-1 text-[8px] text-slate-400">
              <MessageCircle size={9} />
              <span>
                Based on your YojnaSetu analysis
              </span>
            </div>

          </div>

        </div>
      )}
    </>
  );
}