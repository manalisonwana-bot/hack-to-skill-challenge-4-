import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, PlusCircle, ArrowRight, ClipboardList, Megaphone, Users, Loader2, Sparkles, CheckSquare } from "lucide-react";
import { Incident } from "../types";

interface IncidentCommandProps {
  selectedStadium: string;
}

export default function IncidentCommand({ selectedStadium }: IncidentCommandProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Incident["category"]>("Facilities");
  const [severity, setSeverity] = useState<Incident["severity"]>("Medium");
  const [useAI, setUseAI] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>("inc-001");

  // Fetch current incidents from server
  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      let aiResult = {
        severity: severity,
        category: category,
        immediateActions: [
          `Cordon off the incident site at ${selectedStadium}.`,
          "Alert nearby volunteers on ground communication channel 2."
        ],
        announcement: "Ground crew is looking into a situation in this sector. Thank you for your patience.",
        volunteerDispatch: severity === "Critical" ? 6 : severity === "High" ? 4 : severity === "Medium" ? 2 : 1
      };

      if (useAI) {
        // Call Gemini assessment
        const geminiRes = await fetch("/api/gemini/incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, stadium: selectedStadium })
        });
        if (geminiRes.ok) {
          const parsed = await geminiRes.json();
          aiResult = {
            ...aiResult,
            ...parsed
          };
        }
      }

      // Save incident to server list
      const saveRes = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stadium: selectedStadium,
          title,
          description,
          category: aiResult.category,
          severity: aiResult.severity
        })
      });

      if (saveRes.ok) {
        // Fetch fresh list
        await fetchIncidents();
        // Reset form
        setTitle("");
        setDescription("");
        // Expand the newly created incident (it is unshifted to top)
        setExpandedId(incidents[0]?.id || null);
      }
    } catch (err) {
      console.error("Failed to create incident:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}/resolve`, {
        method: "PATCH"
      });
      if (res.ok) {
        // locally update or fetch
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? { ...inc, resolved: !inc.resolved } : inc))
        );
      }
    } catch (err) {
      console.error("Failed to toggle resolve:", err);
    }
  };

  const getSeverityStyle = (sev: Incident["severity"]) => {
    switch (sev) {
      case "Critical":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "High":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Medium":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  const getCategoryStyle = (cat: Incident["category"]) => {
    switch (cat) {
      case "Crowd Control":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "Medical":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      case "Security":
        return "bg-orange-500/10 text-orange-300 border-orange-500/30";
      case "Transit":
        return "bg-sky-500/10 text-sky-300 border-sky-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col h-full text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-display">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Tactical Incident Command
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time incident logs & Gemini-powered ground checklists</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Report New Incident Form */}
        <form onSubmit={handleCreateIncident} className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <PlusCircle className="w-4 h-4 text-emerald-400" /> Report New Incident
            </h4>
            <span className="text-[10px] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono font-semibold">
              {selectedStadium}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken barrier near Gate E"
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
              id="input-incident-title"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Location details *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide exact sections, physical signs, and potential crowd flow hazards..."
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
              id="input-incident-description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                id="select-incident-category"
              >
                <option value="Facilities">🛠️ Facilities</option>
                <option value="Crowd Control">👥 Crowd Control</option>
                <option value="Security">🛡️ Security</option>
                <option value="Medical">🩺 Medical</option>
                <option value="Transit">🚇 Transit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ground Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                id="select-incident-severity"
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🟠 High</option>
                <option value="Critical">🔴 Critical</option>
              </select>
            </div>
          </div>

          {/* AI Toggle */}
          <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 text-emerald-500 bg-white/5 focus:ring-emerald-500 cursor-pointer"
              id="checkbox-incident-ai"
            />
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-worldcup-gold fill-worldcup-gold/10" /> Run GenAI Safety Analysis
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !title.trim() || !description.trim()}
            className="w-full bg-rose-500/20 border border-rose-500/30 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-500/35 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-45 disabled:scale-100"
            id="btn-submit-incident"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-worldcup-gold" />
                <span>Generating Safety Guide...</span>
              </>
            ) : (
              <>
                <span>Dispatch Incident Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Incidents List & AI Analysis Display */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Operational Activity Logs ({incidents.filter(i => i.stadium === selectedStadium).length})</span>
            <span className="text-[10px] text-slate-400 text-right">Click to expand checklists</span>
          </h4>

          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
              <span className="text-xs font-mono">Loading active incidents...</span>
            </div>
          ) : incidents.filter(i => i.stadium === selectedStadium).length === 0 ? (
            <div className="border border-dashed border-white/10 bg-white/5 rounded-xl py-12 px-4 text-center text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">All Systems Nominal</p>
              <p className="text-xs mt-1 text-slate-400">No active incidents reported at {selectedStadium} today.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
              {incidents
                .filter((inc) => inc.stadium === selectedStadium)
                .map((inc) => {
                  const isExpanded = expandedId === inc.id;
                  return (
                    <div
                      key={inc.id}
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                        inc.resolved ? "bg-white/3 border-white/5 opacity-70" : "bg-white/5 border-white/15 hover:bg-white/8 shadow-sm"
                      }`}
                      id={`incident-card-${inc.id}`}
                    >
                      {/* Card Header clickable */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                        className="p-4 cursor-pointer flex items-start gap-3 justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-white/5 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">
                              {inc.id}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSeverityStyle(inc.severity)}`}>
                              {inc.severity}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyle(inc.category)}`}>
                              {inc.category}
                            </span>
                            {inc.resolved && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Resolved
                              </span>
                            )}
                          </div>
                          <h5 className={`font-semibold text-sm mt-1.5 ${inc.resolved ? "text-slate-400 line-through" : "text-white"}`}>
                            {inc.title}
                          </h5>
                          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                            {inc.description}
                          </p>
                        </div>
                        
                        {/* Resolve toggle button */}
                        <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleResolve(inc.id)}
                            className={`p-1.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                              inc.resolved
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                            }`}
                            id={`btn-resolve-${inc.id}`}
                            title={inc.resolved ? "Mark Active" : "Mark Resolved"}
                          >
                            <CheckSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">{inc.resolved ? "Reopen" : "Resolve"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section (AI generated guidelines) */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-white/10 bg-slate-950/40 flex flex-col gap-4">
                          <div className="text-xs text-slate-200 leading-relaxed bg-white/5 border border-white/10 p-3 rounded-lg">
                            <span className="font-bold text-white">Detailed logs:</span> {inc.description}
                            <div className="text-[10px] text-slate-400 mt-2 font-mono">
                              Reported at: {new Date(inc.timestamp).toLocaleTimeString()}
                            </div>
                          </div>

                          {/* AI Actions */}
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1 mb-2 font-mono uppercase tracking-wider">
                              <ClipboardList className="w-3.5 h-3.5 text-worldcup-gold" /> Immediate Tactical Checklist (AI)
                            </div>
                            <ul className="text-xs text-slate-300 flex flex-col gap-1.5 pl-4 list-disc">
                              {inc.immediateActions.map((action, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Dispatch Suggestion */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-3">
                              <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                              <div>
                                <div className="text-[9px] text-slate-400 font-mono uppercase font-bold">Suggested Patrol Dispatch</div>
                                <div className="text-sm font-bold text-white">{inc.volunteerDispatch} Volunteers</div>
                              </div>
                            </div>

                            {inc.announcement && (
                              <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-start gap-3">
                                <Megaphone className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[9px] text-slate-400 font-mono uppercase font-bold">Loudspeaker PA Script</div>
                                  <p className="text-xs italic text-slate-200 mt-0.5 leading-relaxed font-sans">
                                    "{inc.announcement}"
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
