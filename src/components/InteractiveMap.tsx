import React from "react";
import { Info, Accessibility, HeartPulse, Recycle, MapPin, Bus, Navigation } from "lucide-react";

interface InteractiveMapProps {
  selectedStadium: string;
  onSelectSector: (sector: "North" | "South" | "East" | "West") => void;
  onSuggestPrompt: (prompt: string) => void;
  activeSector: string;
}

export default function InteractiveMap({
  selectedStadium,
  onSelectSector,
  onSuggestPrompt,
  activeSector
}: InteractiveMapProps) {
  const pointsOfInterest = [
    {
      id: "sensory",
      label: "Sensory Room",
      icon: Accessibility,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
      prompt: "Where is the KultureCity sensory respite room and what accommodations does it provide?",
      x: "50%",
      y: "35%"
    },
    {
      id: "firstaid",
      label: "First Aid Station",
      icon: HeartPulse,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
      prompt: "I have a minor medical need, where is the nearest First Aid center and how can volunteers assist me?",
      x: "30%",
      y: "55%"
    },
    {
      id: "recycling",
      label: "Sustainability Sort Hub",
      icon: Recycle,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      prompt: "How does the reusable cup deposit work and what are the rules for composting organic food waste here?",
      x: "70%",
      y: "55%"
    },
    {
      id: "transit",
      label: "Transit Terminal",
      icon: Bus,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
      prompt: "What is the best way to return to the city transit center after the match? Where is the rideshare zone?",
      x: "50%",
      y: "85%"
    }
  ];

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col h-full text-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white font-display">Interactive Venue Blueprint</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedStadium} • Click sectors to inspect</p>
        </div>
        <div className="flex gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] bg-white/5 text-emerald-400 border border-white/10 px-2.5 py-0.5 rounded-full font-mono font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Telemetry Active
          </span>
        </div>
      </div>

      {/* SVG Interactive Stadium Map container */}
      <div className="relative flex-1 min-h-[320px] bg-slate-900/40 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-4">
        {/* Stadium outline SVG */}
        <svg viewBox="0 0 500 400" className="w-full max-w-[420px] h-auto drop-shadow-md select-none">
          {/* Outer Boundary */}
          <rect x="10" y="10" width="480" height="380" rx="40" fill="rgba(15, 23, 42, 0.4)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="4" />
          
          {/* External Parking / Transport connections */}
          <line x1="250" y1="10" x2="250" y2="60" stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="4 4" strokeWidth="2" />
          <line x1="250" y1="340" x2="250" y2="390" stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="4 4" strokeWidth="2" />
          <line x1="10" y1="200" x2="70" y2="200" stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="4 4" strokeWidth="2" />
          <line x1="430" y1="200" x2="490" y2="200" stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="4 4" strokeWidth="2" />

          {/* Stadium outer pitch bowl */}
          <ellipse cx="250" cy="200" rx="180" ry="130" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="5" />
          
          {/* Stadium stands - broken into 4 interactive sectors */}
          {/* North Sector */}
          <path
            d="M 120 120 A 180 130 0 0 1 380 120 L 340 150 A 130 90 0 0 0 160 150 Z"
            fill={activeSector === "North" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.04)"}
            stroke={activeSector === "North" ? "#10b981" : "rgba(255, 255, 255, 0.15)"}
            strokeWidth="2"
            className="cursor-pointer transition-all duration-300 hover:fill-white/10"
            onClick={() => onSelectSector("North")}
          />
          
          {/* South Sector */}
          <path
            d="M 120 280 A 180 130 0 0 0 380 280 L 340 250 A 130 90 0 0 1 160 250 Z"
            fill={activeSector === "South" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.04)"}
            stroke={activeSector === "South" ? "#10b981" : "rgba(255, 255, 255, 0.15)"}
            strokeWidth="2"
            className="cursor-pointer transition-all duration-300 hover:fill-white/10"
            onClick={() => onSelectSector("South")}
          />

          {/* East Sector */}
          <path
            d="M 380 120 A 180 130 0 0 1 380 280 L 340 250 A 130 90 0 0 0 340 150 Z"
            fill={activeSector === "East" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.04)"}
            stroke={activeSector === "East" ? "#10b981" : "rgba(255, 255, 255, 0.15)"}
            strokeWidth="2"
            className="cursor-pointer transition-all duration-300 hover:fill-white/10"
            onClick={() => onSelectSector("East")}
          />

          {/* West Sector */}
          <path
            d="M 120 120 A 180 130 0 0 0 120 280 L 160 250 A 130 90 0 0 1 160 150 Z"
            fill={activeSector === "West" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.04)"}
            stroke={activeSector === "West" ? "#10b981" : "rgba(255, 255, 255, 0.15)"}
            strokeWidth="2"
            className="cursor-pointer transition-all duration-300 hover:fill-white/10"
            onClick={() => onSelectSector("West")}
          />

          {/* Central Pitch (Field of Play) */}
          <rect x="180" y="160" width="140" height="80" rx="10" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" />
          <line x1="250" y1="160" x2="250" y2="240" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
          <circle cx="250" cy="200" r="25" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />

          {/* Text Labels inside sectors */}
          <text x="250" y="95" textAnchor="middle" fill={activeSector === "North" ? "#10b981" : "rgba(255, 255, 255, 0.45)"} className="text-[12px] font-bold font-display select-none pointer-events-none">NORTH STAND</text>
          <text x="250" y="315" textAnchor="middle" fill={activeSector === "South" ? "#10b981" : "rgba(255, 255, 255, 0.45)"} className="text-[12px] font-bold font-display select-none pointer-events-none">SOUTH STAND</text>
          <text x="410" y="205" textAnchor="middle" fill={activeSector === "East" ? "#10b981" : "rgba(255, 255, 255, 0.45)"} className="text-[12px] font-bold font-display select-none pointer-events-none">EAST</text>
          <text x="90" y="205" textAnchor="middle" fill={activeSector === "West" ? "#10b981" : "rgba(255, 255, 255, 0.45)"} className="text-[12px] font-bold font-display select-none pointer-events-none">WEST</text>
        </svg>

        {/* Hotspot Floating Buttons (Points of Interest) */}
        {pointsOfInterest.map((poi) => {
          const IconComponent = poi.icon;
          return (
            <button
              key={poi.id}
              onClick={() => onSuggestPrompt(poi.prompt)}
              className={`absolute flex items-center justify-center p-2 rounded-full border shadow-md hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer ${poi.color}`}
              style={{ left: poi.x, top: poi.y, transform: "translate(-50%, -50%)" }}
              title={`Ask AI about: ${poi.label}`}
              id={`map-hotspot-${poi.id}`}
            >
              <IconComponent className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-white">Aesthetic Venue Navigation Map</p>
          <p className="mt-1">
            Tap on any quadrant (<span className="font-semibold text-emerald-400">North, South, East, West</span>) to inspect live crowd telemetry. Press any colorful icon to automatically draft tailored accessibility, safety, or eco-sustainability prompts for the GenAI concierge.
          </p>
        </div>
      </div>
    </div>
  );
}
