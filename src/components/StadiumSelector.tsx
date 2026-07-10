import React from "react";
import { Landmark, Users, MapPin, Sparkles } from "lucide-react";

interface StadiumSelectorProps {
  currentStadium: string;
  onStadiumChange: (stadium: string) => void;
}

export default function StadiumSelector({ currentStadium, onStadiumChange }: StadiumSelectorProps) {
  const stadiums = [
    {
      name: "MetLife Stadium",
      city: "East Rutherford, NJ/NY",
      capacity: "82,500",
      flag: "🇺🇸",
      color: "border-blue-500 text-blue-600 bg-blue-50/50"
    },
    {
      name: "SoFi Stadium",
      city: "Los Angeles, CA",
      capacity: "70,000",
      flag: "🇺🇸",
      color: "border-indigo-500 text-indigo-600 bg-indigo-50/50"
    },
    {
      name: "Estadio Azteca",
      city: "Mexico City, Mexico",
      flag: "🇲🇽",
      capacity: "87,500",
      color: "border-emerald-500 text-emerald-600 bg-emerald-50/50"
    }
  ];

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-display">
              FIFA World Cup 2026
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-mono">
              <Sparkles className="w-3 h-3 text-worldcup-gold" /> GenAI Operational Core
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-display mt-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Smart Venue Hub
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Optimizing multi-lingual accessibility, live crowds control dispatch, and immediate hazard checklists via server-side Gemini 3.5.
          </p>
        </div>

        {/* Stadium Selection Group */}
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          {stadiums.map((st) => (
            <button
              key={st.name}
              id={`btn-stadium-${st.name.replace(/\s+/g, "").toLowerCase()}`}
              onClick={() => onStadiumChange(st.name)}
              className={`flex flex-col text-left px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                currentStadium === st.name
                  ? "bg-white/15 text-white border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-102 font-medium"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-1.5 justify-between w-full">
                <span className="font-semibold text-sm">{st.name}</span>
                <span className="text-xs">{st.flag}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] opacity-80">
                <MapPin className="w-3 h-3 shrink-0 text-emerald-400" />
                <span className="truncate max-w-[120px]">{st.city}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats grid below */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Landmark className="w-5 h-5 text-worldcup-gold" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Active Venue</div>
            <div className="text-sm font-semibold text-white">{currentStadium}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Users className="w-5 h-5 text-worldcup-gold" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Match Capacity</div>
            <div className="text-sm font-semibold text-white">
              {stadiums.find((s) => s.name === currentStadium)?.capacity || "80,000"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-base">📅</span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Tournament Phase</div>
            <div className="text-sm font-semibold text-white">Knockout Finals 2026</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-base">🛡️</span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">AI Command State</div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
