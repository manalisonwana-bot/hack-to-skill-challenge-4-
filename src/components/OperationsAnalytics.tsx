import React, { useState } from "react";
import { BarChart3, Sliders, Sparkles, RefreshCw, AlertCircle, Loader2, Landmark } from "lucide-react";

interface OperationsAnalyticsProps {
  selectedStadium: string;
}

export default function OperationsAnalytics({ selectedStadium }: OperationsAnalyticsProps) {
  // Telemetry Sliders States
  const [attendance, setAttendance] = useState(78500);
  const [densities, setDensities] = useState({
    North: 65,
    South: 45,
    East: 82,
    West: 50
  });
  const [gateWaits, setGateWaits] = useState({
    "North Gate": 15,
    "South Gate": 10,
    "East Gate": 12,
    "West Gate": 28
  });
  const [transitDelays, setTransitDelays] = useState({
    train: 10,
    rideshare: 20
  });

  // Briefing state
  const [briefing, setBriefing] = useState<string | null>(
    `**AI Operations Briefing Ready**\n\nConfigure the active match telemetry parameters on the left sliders and press **"Compile AI Commander's Briefing"** to request real-time crowd dispersion strategies, dispatch instructions, and accessibility guidelines from Gemini.`
  );
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAIBriefing = async () => {
    setLoadingBrief(true);
    setError(null);
    try {
      const res = await fetch("/api/gemini/metrics-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stadium: selectedStadium,
          attendance,
          sectorDensities: densities,
          gateWaits,
          transitDelays
        })
      });

      if (!res.ok) {
        throw new Error("Briefing compilation failed. Server responded with error.");
      }

      const data = await res.json();
      setBriefing(data.summary || "No briefing text returned.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred compiling the commander's brief.");
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleDensityChange = (sector: keyof typeof densities, val: number) => {
    setDensities((prev) => ({ ...prev, [sector]: val }));
  };

  const handleGateWaitChange = (gate: keyof typeof gateWaits, val: number) => {
    setGateWaits((prev) => ({ ...prev, [gate]: val }));
  };

  const handleQuickScenario = (type: "pre-kickoff" | "halftime" | "post-match") => {
    if (type === "pre-kickoff") {
      setAttendance(81200);
      setDensities({ North: 75, South: 60, East: 55, West: 40 });
      setGateWaits({ "North Gate": 35, "South Gate": 12, "East Gate": 22, "West Gate": 30 });
      setTransitDelays({ train: 15, rideshare: 8 });
    } else if (type === "halftime") {
      setAttendance(79800);
      setDensities({ North: 85, South: 88, East: 80, West: 75 }); // food stalls full
      setGateWaits({ "North Gate": 5, "South Gate": 5, "East Gate": 5, "West Gate": 5 });
      setTransitDelays({ train: 5, rideshare: 5 });
    } else { // post-match
      setAttendance(76500);
      setDensities({ North: 30, South: 25, East: 35, West: 20 });
      setGateWaits({ "North Gate": 2, "South Gate": 2, "East Gate": 2, "West Gate": 2 });
      setTransitDelays({ train: 40, rideshare: 55 }); // massive exit queues
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col h-full text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-display">
            <BarChart3 className="w-5 h-5 text-worldcup-gold animate-pulse" /> Operational Analytics & AI Brief
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Simulate match conditions to generate strategic commander briefings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Panel */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Sliders className="w-4 h-4 text-emerald-400" /> Telemetry Simulator
            </h4>
            {/* Quick Presets */}
            <div className="flex gap-1">
              <button
                onClick={() => handleQuickScenario("pre-kickoff")}
                className="text-[9px] font-bold bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-slate-300 px-2 py-1 rounded cursor-pointer transition-all"
                title="Simulate gates crowd influx before match kickoff"
              >
                Inflow
              </button>
              <button
                onClick={() => handleQuickScenario("halftime")}
                className="text-[9px] font-bold bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-slate-300 px-2 py-1 rounded cursor-pointer transition-all"
                title="Simulate concourse crowd dispersion during halftime"
              >
                Halftime
              </button>
              <button
                onClick={() => handleQuickScenario("post-match")}
                className="text-[9px] font-bold bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-slate-300 px-2 py-1 rounded cursor-pointer transition-all"
                title="Simulate heavy transit queues after the match"
              >
                Outflow
              </button>
            </div>
          </div>

          {/* Slider 1: Attendance */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Active Attendance</span>
              <span className="font-mono text-emerald-400 font-bold">{attendance.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="90000"
              step="500"
              value={attendance}
              onChange={(e) => setAttendance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Sector densities */}
          <div className="border-t border-white/10 pt-3">
            <span className="text-xs font-bold text-emerald-400 block mb-2 font-mono uppercase tracking-wider">Sector Crowd Density</span>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(densities) as Array<keyof typeof densities>).map((sec) => (
                <div key={sec}>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                    <span>{sec} Stand</span>
                    <span className="font-mono font-semibold text-emerald-400">{densities[sec]}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={densities[sec]}
                    onChange={(e) => handleDensityChange(sec, parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gate Wait times */}
          <div className="border-t border-white/10 pt-3">
            <span className="text-xs font-bold text-emerald-400 block mb-2 font-mono uppercase tracking-wider">Gate Queue Times</span>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(gateWaits) as Array<keyof typeof gateWaits>).map((gate) => (
                <div key={gate}>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                    <span>{gate}</span>
                    <span className="font-mono font-semibold text-emerald-400">{gateWaits[gate]}m</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={gateWaits[gate]}
                    onChange={(e) => handleGateWaitChange(gate, parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Transit delays */}
          <div className="border-t border-white/10 pt-3">
            <span className="text-xs font-bold text-emerald-400 block mb-2 font-mono uppercase tracking-wider">Transit Delay Minutes</span>
            <div className="flex flex-col gap-2.5">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                  <span>Meadowlands Train / C-Line Shuttle</span>
                  <span className="font-mono font-semibold text-emerald-400">{transitDelays.train}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={transitDelays.train}
                  onChange={(e) => setTransitDelays((prev) => ({ ...prev, train: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                  <span>Rideshare Stand Pickup Wait</span>
                  <span className="font-mono font-semibold text-emerald-400">{transitDelays.rideshare}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={transitDelays.rideshare}
                  onChange={(e) => setTransitDelays((prev) => ({ ...prev, rideshare: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={triggerAIBriefing}
            disabled={loadingBrief}
            className="w-full bg-emerald-500/20 border border-emerald-500/30 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-500/35 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-45"
            id="btn-compile-briefing"
          >
            {loadingBrief ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-worldcup-gold" />
                <span>Running Tactical Diagnostics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-worldcup-gold fill-worldcup-gold/15" />
                <span>Compile AI Commander's Briefing</span>
              </>
            )}
          </button>
        </div>

        {/* Display Panel */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[350px]">
          <div className="flex-1 border border-white/10 rounded-2xl bg-slate-900/40 shadow-inner p-5 max-h-[460px] overflow-y-auto">
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loadingBrief ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
                <span className="text-sm font-mono text-slate-400 animate-pulse">Consulting safety engine & routing models...</span>
              </div>
            ) : briefing ? (
              <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed font-sans">
                {briefing.split("\n").map((line, idx) => {
                  if (line.startsWith("### ")) {
                    return (
                      <h5 key={idx} className="text-sm font-bold text-white mt-4 mb-2 font-display uppercase tracking-wide border-b border-white/10 pb-1">
                        {line.replace("### ", "")}
                      </h5>
                    );
                  } else if (line.startsWith("- **") || line.startsWith("* **")) {
                    const cleanLine = line.replace(/^[-*]\s+/, "");
                    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <div key={idx} className="flex items-start gap-2 my-2 pl-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <p className="flex-1 m-0">
                          {parts.map((p, pIdx) => {
                            if (p.startsWith("**") && p.endsWith("**")) {
                              return <strong key={pIdx} className="font-bold text-white">{p.slice(2, -2)}</strong>;
                            }
                            return p;
                          })}
                        </p>
                      </div>
                    );
                  } else if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={idx} className="font-bold text-white text-sm mt-3 mb-1">
                        {line.slice(2, -2)}
                      </p>
                    );
                  } else {
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                        {parts.map((p, pIdx) => {
                          if (p.startsWith("**") && p.endsWith("**")) {
                            return <strong key={pIdx} className="font-bold text-white">{p.slice(2, -2)}</strong>;
                          }
                          return p;
                        })}
                      </p>
                    );
                  }
                })}
              </div>
            ) : null}
          </div>

          <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2 text-[11px] text-slate-400 font-mono">
            <span className="text-emerald-400">✔</span>
            <span>
              Real-time feed represents automated sensor counts from digital tickets scanner, BLE beacon crowd tracks, and metropolitan transit logs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
