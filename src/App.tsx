import React, { useState } from "react";
import { Sparkles, Info, Heart, Accessibility, ShieldCheck, Ticket, LayoutDashboard } from "lucide-react";
import StadiumSelector from "./components/StadiumSelector";
import InteractiveMap from "./components/InteractiveMap";
import FanConcierge from "./components/FanConcierge";
import IncidentCommand from "./components/IncidentCommand";
import OperationsAnalytics from "./components/OperationsAnalytics";

export default function App() {
  const [selectedStadium, setSelectedStadium] = useState("MetLife Stadium");
  const [perspective, setPerspective] = useState<"fan" | "ops">("fan");
  
  // State to bridge prompt suggestion from map click to FanConcierge input
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [activeSector, setActiveSector] = useState<"North" | "South" | "East" | "West">("North");

  const handleSelectSector = (sector: "North" | "South" | "East" | "West") => {
    setActiveSector(sector);
    setSuggestedPrompt(`I am sitting in the ${sector} Stand. Can you check if there are nearby accessible elevators or sensory room corridors close to this section?`);
  };

  const handleSuggestPromptFromPoi = (prompt: string) => {
    setSuggestedPrompt(prompt);
  };

  const clearSuggestedPrompt = () => {
    setSuggestedPrompt("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Absolute Frosted Glow Orbs background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/25 rounded-full blur-[120px]"></div>
        <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[100px]"></div>
      </div>

      {/* Universal Header */}
      <header className="bg-white/5 border-b border-white/10 py-3.5 px-4 sm:px-6 sticky top-0 z-50 backdrop-blur-md shadow-lg/10 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500/40 to-emerald-500/40 rounded-xl flex items-center justify-center text-white font-display font-extrabold text-lg border border-white/20 select-none backdrop-blur-sm">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-white font-display uppercase tracking-wider">
                  ArenaFlow 2026
                </h1>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full uppercase">
                  v1.2 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">FIFA World Cup Stadium Operations Hub</p>
            </div>
          </div>

          {/* Perspective Selector and Info Badge */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
              <button
                id="tab-fan-assist"
                onClick={() => setPerspective("fan")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  perspective === "fan"
                    ? "bg-white/15 text-emerald-400 border border-white/10 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>🎟️ Fan Assist Portal</span>
              </button>
              
              <button
                id="tab-stadium-command"
                onClick={() => setPerspective("ops")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  perspective === "ops"
                    ? "bg-white/15 text-emerald-400 border border-white/10 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>🦺 Stadium Control Center</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 relative z-10">
        
        {/* Active Venue selector card */}
        <StadiumSelector currentStadium={selectedStadium} onStadiumChange={setSelectedStadium} />

        {/* Dynamic Views depending on selected perspective */}
        <div className="transition-all duration-300">
          {perspective === "fan" ? (
            /* FAN PORTAL VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Interactive Stadium Layout */}
              <div className="lg:col-span-6 flex flex-col">
                <InteractiveMap
                  selectedStadium={selectedStadium}
                  onSelectSector={handleSelectSector}
                  onSuggestPrompt={handleSuggestPromptFromPoi}
                  activeSector={activeSector}
                />
              </div>

              {/* Right Column: Multi-lingual AI Assistant */}
              <div className="lg:col-span-6 flex flex-col">
                <FanConcierge
                  selectedStadium={selectedStadium}
                  suggestedPrompt={suggestedPrompt}
                  onClearSuggestedPrompt={clearSuggestedPrompt}
                />
              </div>

            </div>
          ) : (
            /* OPERATIONAL COMMAND VIEW */
            <div className="grid grid-cols-1 gap-6">
              
              {/* Operations Analytics simulator & AI commander briefing */}
              <OperationsAnalytics selectedStadium={selectedStadium} />

              {/* Live ground Incident Command Center */}
              <IncidentCommand selectedStadium={selectedStadium} />

            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white/5 border-t border-white/10 py-6 px-4 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ArenaFlow 2026 Intelligence Suite</span>
            <span>•</span>
            <span>Designed for the FIFA World Cup 2026 Host Cities</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Accessibility className="w-3.5 h-3.5 text-worldcup-gold" /> WCAG 2.2 Compliant
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Server Secure Gemini Core
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
