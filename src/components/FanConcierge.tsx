import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle, Languages, UserCheck, RefreshCw, Accessibility, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";

interface FanConciergeProps {
  selectedStadium: string;
  suggestedPrompt: string;
  onClearSuggestedPrompt: () => void;
}

export default function FanConcierge({
  selectedStadium,
  suggestedPrompt,
  onClearSuggestedPrompt
}: FanConciergeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to the **FIFA World Cup 2026** Concierge! ⚽\n\nI am configured with full operational layouts, transit schedules, sustainability compost guidelines, and accessibility support maps for **${selectedStadium}**.\n\nHow can I help you have a safe, clean, and incredible matchday today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [role, setRole] = useState("Fan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const languagesList = [
    { name: "English", flag: "🇺🇸" },
    { name: "Español", flag: "🇲🇽" },
    { name: "Français", flag: "🇫🇷" },
    { name: "Deutsch", flag: "🇩🇪" },
    { name: "日本語", flag: "🇯🇵" },
    { name: "Português", flag: "🇧🇷" },
    { name: "العربية", flag: "🇶🇦" }
  ];

  const rolePills = [
    { label: "General Fan", value: "Fan", emoji: "🎟️" },
    { label: "Volunteers Guide", value: "Volunteer", emoji: "🙋‍♂️" },
    { label: "Venue Ground Staff", value: "Venue-Staff", emoji: "🦺" }
  ];

  const quickPrompts = [
    {
      label: "♿ Wheelchair Assistance",
      text: "What are the accessibility ramps, companion seat protocols, and wheelchair loan procedures?"
    },
    {
      label: "🌱 Sustainable Sorting",
      text: "Tell me about the reusable cup deposit refund and where composting stations are."
    },
    {
      label: "🚇 Transit Schedule",
      text: "How do I take the local public transit or train shuttle to return to the city center easily after the match?"
    },
    {
      label: "🌭 Concession Info",
      text: "Are there sensory respite seating or vegetarian food options close to the main entrance gates?"
    }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle suggested prompt from parent (e.g. Map interaction)
  useEffect(() => {
    if (suggestedPrompt) {
      setInputPrompt(suggestedPrompt);
      onClearSuggestedPrompt();
    }
  }, [suggestedPrompt, onClearSuggestedPrompt]);

  // Reset chat welcome on stadium switch
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${selectedStadium}`,
        role: "assistant",
        content: `You have loaded **${selectedStadium}** concierge assistance. 🗺️\n\nI can provide exact gate assignments, transit locations, and sensory rooms accommodations for this stadium in your preferred language (${language}). Ask me anything!`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [selectedStadium]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          language: language,
          stadium: selectedStadium,
          role: role,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error("Assistant service failed to respond.");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.text || "I was unable to retrieve details.",
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected communication issue occurred.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-clear`,
        role: "assistant",
        content: `Chat session refreshed. Asking about **${selectedStadium}** as a **${role}** in **${language}**.`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-xl flex flex-col h-full text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-worldcup-gold shrink-0 fill-worldcup-gold/20" /> GenAI Concierge
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Instant multi-lingual assistance & accessibility guides</p>
        </div>

        {/* Configurations Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none pr-1 text-xs cursor-pointer font-sans text-slate-200 [&>option]:bg-slate-900 [&>option]:text-white"
              id="select-assist-language"
            >
              {languagesList.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Restart conversation"
            id="btn-clear-chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="mt-4 flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
        {rolePills.map((p) => (
          <button
            key={p.value}
            id={`btn-role-${p.value.toLowerCase()}`}
            onClick={() => setRole(p.value)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              role === p.value
                ? "bg-white/15 text-white border border-white/10 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[380px] my-4 p-4 rounded-xl bg-slate-900/40 border border-white/10 flex flex-col gap-4 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.role === "user" ? "self-end items-end" : "self-start items-start"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono text-slate-400">
                {m.role === "user" ? "You" : `FIFA GenAI (${language})`}
              </span>
              <span className="text-[10px] font-mono text-slate-400">•</span>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div
              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-emerald-500/20 text-white border border-emerald-500/30 rounded-tr-none"
                  : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none shadow-sm"
              }`}
            >
              {/* Parse basic bolding markdown */}
              {m.content.split("\n").map((line, i) => {
                // simple regex for bold markdown **text**
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {parts.map((part, index) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="self-start flex flex-col items-start max-w-[80%]">
            <span className="text-[10px] font-mono text-slate-400 mb-1">AI Agent thinking...</span>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="self-center bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick-action chips */}
      <div className="mb-4">
        <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-worldcup-gold" /> Quick Query Suggestions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputPrompt(q.text);
                handleSendMessage(q.text);
              }}
              className="text-xs bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer text-left"
              id={`quick-chip-${idx}`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputPrompt);
        }}
        className="flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={`Ask about ${selectedStadium} as a ${role}...`}
          className="flex-1 bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
          id="input-assist-prompt"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="bg-emerald-500/20 border border-emerald-500/30 text-white p-3 rounded-xl hover:bg-emerald-500/35 active:scale-95 disabled:opacity-45 disabled:scale-100 transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
          id="btn-send-assist"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
