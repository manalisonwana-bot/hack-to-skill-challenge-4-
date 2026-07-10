import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
// We use a lazy initialization pattern to avoid crashing if the API key is not set yet
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Real Gemini calls will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory Incident Logs for Stadium Command
let incidentLogs = [
  {
    id: "inc-001",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45m ago
    stadium: "MetLife Stadium",
    title: "Slick floor spill near concession Area 112",
    description: "Large soda beverage spilled on highly trafficked concrete corridor near Area 112. Hazard for running children or senior fans.",
    category: "Facilities",
    severity: "Medium",
    resolved: false,
    volunteerDispatch: 2,
    immediateActions: [
      "Deploy warning caution signage.",
      "Dispatch sanitation team with dry mops.",
      "Reroute incoming crowd line slightly to the left corridor."
    ],
    announcement: "Caution: Concourse corridor near Section 112 has a wet surface. Please walk slowly and follow volunteer directions."
  },
  {
    id: "inc-002",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    stadium: "SoFi Stadium",
    title: "Ticket turnstile reader scanner error at Gate E",
    description: "Scan speed dropped by 60% due to firmware communication timeout on columns 4 and 5.",
    category: "Transit",
    severity: "High",
    resolved: false,
    volunteerDispatch: 4,
    immediateActions: [
      "Deploy manual ticket check supervisors.",
      "Reroute general public queues to Gates D and F.",
      "Reboot firmware system router at Gate E communications cabinet."
    ],
    announcement: "Gate E ticket holders: please proceed to Gates D or F for accelerated scanning. Our ground staff is on-site to assist."
  },
  {
    id: "inc-003",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    stadium: "Estadio Azteca",
    title: "Lost child reunited at Guest Services Central",
    description: "An 8-year-old child wearing a yellow Brazil jersey was found near gate division 2. Guest services tracked family within 20 minutes.",
    category: "Security",
    severity: "Low",
    resolved: true,
    volunteerDispatch: 1,
    immediateActions: [
      "Verify parents IDs against registered digital match passes.",
      "Reunite families at Safe Zone 3.",
      "Close incident ticket."
    ],
    announcement: ""
  }
];

// Context database of Stadium Layouts and Accessibility options
const STADIUMS_DB = {
  "MetLife Stadium": {
    city: "East Rutherford, NJ/NY",
    capacity: "82,500",
    gates: ["Gate A (West - near Train Station)", "Gate B (North)", "Gate C (North-East)", "Gate D (East)", "Gate E (South-East)", "Gate F (South)", "Gate G (South-West)"],
    accessibility: {
      ramps: "Ramps are located at all five main entrance gates.",
      elevators: "Public elevators are accessible near Sections 104, 124, 143, and inside the VIP Club Entrances.",
      sensoryRooms: "Sensory Room provided by KultureCity located on the Plaza Level near Gate D.",
      wheelchairSeating: "Wheelchair platforms are located in Sections 109, 117, 124, 135, 201, 224, 305, 324, and 342."
    },
    sustainability: {
      bins: "Dual-stream recycling bins (blue for bottles/cans, green for organics compost, gray for landfill landfill landfill) at every 20 meters.",
      cups: "Cup deposit returns - refund of $1.50 per cup returned to compost stations.",
      ecoGoal: "Targeting 95% zero-waste diversion for World Cup 2026."
    },
    transportation: {
      train: "NJ Transit Meadowlands Rail Station connects directly to Secaucus Junction.",
      bus: "Coach USA Express Bus service departs from NYC Port Authority Terminal directly to Lot K.",
      rideshare: "Designated rideshare zone located strictly in Parking Lot E."
    }
  },
  "SoFi Stadium": {
    city: "Los Angeles, CA",
    capacity: "70,000 (expandable to 100,000)",
    gates: ["Gate 1 (North)", "Gate 2 (East)", "Gate 3 (South-East)", "Gate 4 (South)", "Gate 5 (South-West)", "Gate 6 (West)", "Gate 7 (North-West)"],
    accessibility: {
      ramps: "The entire outer perimeter is ramped. Indoor pedestrian canyon trails connect all concourses.",
      elevators: "Escalators and elevators are located heavily on East and West sides (Sections 100-112, 120-132).",
      sensoryRooms: "Sensory room is situated on Level 3 near the Northeast Pedestrian bridge.",
      wheelchairSeating: "Available on all levels with dedicated companion seating."
    },
    sustainability: {
      bins: "Smart optical sorting bins automatically scan waste item material.",
      cups: "Made of 100% recyclable infinitely-reusable aluminum.",
      ecoGoal: "100% solar powered through adjacent regional grid integration."
    },
    transportation: {
      shuttle: "Metro Rail C-Line Hawthorne/Lennox shuttle bus runs every 5 minutes on matchdays.",
      rideshare: "Rideshare passenger drop-off is located in Parking Lot N; pick-up in Lot N.",
      parking: "Pre-booking required for on-site Lots A-N."
    }
  },
  "Estadio Azteca": {
    city: "Mexico City, Mexico",
    capacity: "87,500",
    gates: ["Gate 1 (North Main)", "Gate 2 (East)", "Gate 3 (South)", "Gate 4 (Insurgentes / West)"],
    accessibility: {
      ramps: "Main spiral concrete ramps connect all primary levels (Plateas, Especiales).",
      elevators: "Elevators located in the Tunnel entrance and Western central hub.",
      sensoryRooms: "Sensory respite area is set up on the Plateas lower level near Gate 1 Guest Booth.",
      wheelchairSeating: "Wheelchair accessible zone situated on the first tier plateau, accessible through special tunnel entry."
    },
    sustainability: {
      water: "Rainwater harvesting system provides non-potable flushing for stadium rest facilities.",
      bins: "Separate organic composting bins strictly labeled for food residues.",
      cups: "Eco-compostable cornstarch-based cups with a custom green return program.",
      ecoGoal: "Reduction of plastic footprints with zero single-use plastics permitted in concessions."
    },
    transportation: {
      train: "Xochimilco Light Rail (Tren Ligero) departs from Metro Tasqueña directly to Estadio Azteca Station.",
      bus: "Local Pesero minibuses connect from Calzada de Tlalpan.",
      rideshare: "Rideshare pick-up/drop-off zone situated at the gate entrance of the Aztec Esplanade."
    }
  }
};

// 1. Get current incident list
app.get("/api/incidents", (req, res) => {
  res.json({ incidents: incidentLogs });
});

// 2. Add custom incident
app.post("/api/incidents", (req, res) => {
  const { stadium, title, description, category, severity } = req.body;
  if (!stadium || !title || !description || !category || !severity) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const newInc = {
    id: `inc-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    stadium,
    title,
    description,
    category,
    severity,
    resolved: false,
    volunteerDispatch: severity === "Critical" ? 6 : severity === "High" ? 4 : severity === "Medium" ? 2 : 1,
    immediateActions: [
      `Alert nearest sector lead at ${stadium}.`,
      "Dispatch standard volunteer responders to cordon the area."
    ],
    announcement: `Stadium announcement: attention near sector corridor: please remain calm and follow our staff directions.`
  };

  incidentLogs.unshift(newInc);
  res.json({ success: true, incident: newInc });
});

// 3. Toggle Incident Resolve Status
app.patch("/api/incidents/:id/resolve", (req, res) => {
  const { id } = req.params;
  const incident = incidentLogs.find((i) => i.id === id);
  if (incident) {
    incident.resolved = !incident.resolved;
    return res.json({ success: true, incident });
  }
  res.status(404).json({ error: "Incident not found" });
});

// 4. GenAI Incident Analysis & Checklist Generator
app.post("/api/gemini/incident", async (req, res) => {
  const { title, description, stadium } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback Mock Data with delay to simulate real latency
    console.log("Using Mock Incident AI assessment (No API key)");
    setTimeout(() => {
      const mockSeverity = description.toLowerCase().includes("fire") || description.toLowerCase().includes("collapse") || description.toLowerCase().includes("injured") ? "Critical" : "Medium";
      const mockDispatch = mockSeverity === "Critical" ? 6 : 3;
      return res.json({
        severity: mockSeverity,
        category: "Facilities",
        immediateActions: [
          "Establish a 15-meter safety perimeter around the affected area.",
          `Inform the ${stadium || "Stadium"} Control Room immediately via channel 1.`,
          "Deploy nearest mobile volunteer unit to assist with public diversion.",
          "Keep walkways clear for specialized safety crew arrival."
        ],
        announcement: `ATTENTION FANS: Ground staff is handling a temporary situation near this sector. Please proceed smoothly to the next available corridor.`,
        volunteerDispatch: mockDispatch,
        isMock: true
      });
    }, 1200);
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `Analyze this live operational incident occurring at a FIFA World Cup 2026 stadium (${stadium || "MetLife Stadium"}):
Title: ${title}
Description: ${description}

Respond strictly in JSON format. The JSON must match this TypeScript interface structure:
{
  "severity": "Low" | "Medium" | "High" | "Critical",
  "category": "Crowd Control" | "Medical" | "Facilities" | "Security" | "Transit",
  "immediateActions": string[], // 3-4 bullet-proof, rapid, professional, ground-level actions
  "announcement": string, // Professional, brief stadium loudspeaker announcement draft for calm direction
  "volunteerDispatch": number // Suggested number of volunteer staff to dispatch (integer 1-8)
}

System Context: You are the Lead AI Operations Commander at the FIFA World Cup 2026 Stadium Operations Command Center. Provide safe, responsible, high-efficiency, inclusive, and practical operational intelligence. Avoid unnecessary alarms, and keep announcements extremely calm but clear.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
              description: "The safety severity level."
            },
            category: {
              type: Type.STRING,
              enum: ["Crowd Control", "Medical", "Facilities", "Security", "Transit"],
              description: "The category of the hazard."
            },
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 actionable, urgent response steps."
            },
            announcement: {
              type: Type.STRING,
              description: "Calming stadium public announcement script."
            },
            volunteerDispatch: {
              type: Type.INTEGER,
              description: "Recommended volume of staff to send."
            }
          },
          required: ["severity", "category", "immediateActions", "announcement", "volunteerDispatch"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini incident evaluation error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze incident with Gemini" });
  }
});

// 5. GenAI Fan Assistance Chat Route (Multilingual, accessibility focus)
app.post("/api/gemini/assist", async (req, res) => {
  const { prompt, language, stadium, role, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing assistant prompt" });
  }

  const selectedStadium = stadium || "MetLife Stadium";
  const stadiumContext = STADIUMS_DB[selectedStadium as keyof typeof STADIUMS_DB] || STADIUMS_DB["MetLife Stadium"];
  const targetLanguage = language || "English";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback Mock Assistant responses with smart context
    console.log("Using Mock AI Assistant (No API key)");
    setTimeout(() => {
      let responseText = `[Simulated AI - Config secrets are pending] I'd be happy to guide you! Since we are at **${selectedStadium}**, here is some details: \n\n`;
      const query = prompt.toLowerCase();
      if (query.includes("gate") || query.includes("entrance")) {
        responseText += `The primary gates are: ${stadiumContext.gates.join(", ")}. Please check your digital ticket for your assigned Gate.`;
      } else if (query.includes("accessibility") || query.includes("wheelchair") || query.includes("sensory")) {
        responseText += `**Accessibility Details**: \n- **Sensory Rooms**: ${stadiumContext.accessibility.sensoryRooms}\n- **Elevators**: ${stadiumContext.accessibility.elevators}\n- **Wheelchair platforms**: ${stadiumContext.accessibility.wheelchairSeating}`;
      } else if (query.includes("recycle") || query.includes("trash") || query.includes("sustainable")) {
        responseText += `**Sustainability Info**: \n- **Waste sorting**: ${stadiumContext.sustainability.bins}\n- **Goal**: ${stadiumContext.sustainability.ecoGoal}`;
      } else if (query.includes("train") || query.includes("rideshare") || query.includes("bus") || query.includes("transport")) {
        responseText += `**Transportation**: \n- **Rideshare Zone**: ${stadiumContext.transportation.rideshare || "Refer to general signs"}\n- **Public Transport**: ${JSON.stringify(stadiumContext.transportation)}`;
      } else {
        responseText += `Welcome to the FIFA World Cup 2026. Feel free to ask about accessibility accommodations, gate layouts, waste recycling, or transit links. All answers are optimized in **${targetLanguage}**!`;
      }
      return res.json({ text: responseText, isMock: true });
    }, 1000);
    return;
  }

  try {
    const ai = getAiClient();
    const chatHistory = history || [];

    // System instruction injected with extensive FIFA 2026 context and accessibility details
    const systemInstruction = `You are the friendly, professional, and helpful GenAI Stadium Concierge for the FIFA World Cup 2026.
You are assisting users at the venue: **${selectedStadium}** in **${stadiumContext.city}** (Capacity: ${stadiumContext.capacity}).
The user has the role: **${role || "Fan"}**.
The user prefers responses in the language: **${targetLanguage}**.

STADIUM CONTEXT FOR YOU TO USE:
- GATES: ${stadiumContext.gates.join(", ")}
- ACCESSIBILITY INCLUSION:
  * Elevators: ${stadiumContext.accessibility.elevators}
  * Ramps: ${stadiumContext.accessibility.ramps}
  * Sensory respite/rooms: ${stadiumContext.accessibility.sensoryRooms}
  * Wheelchair assistance: ${stadiumContext.accessibility.wheelchairSeating}
- ECO-SUSTAINABILITY RULES:
  * Sorting: ${stadiumContext.sustainability.bins}
  * Reusable cup program: ${stadiumContext.sustainability.cups}
  * Green goals: ${stadiumContext.sustainability.ecoGoal}
- TRANSPORTATION HUBS:
  * MetLife Train/Bus: NJ Transit Meadowlands Rail, Coach USA NYC Bus, Rideshare Parking Lot E.
  * SoFi Shuttle/Transit: Metro Rail C-Line Shuttle, Rideshare Parking Lot N.
  * Azteca Train/Transit: Xochimilco Light Rail Tasqueña terminal, Aztec Esplanade Rideshare.

YOUR RULES:
1. Always translate your responses into the requested language: ${targetLanguage}.
2. Always emphasize accessibility, clear simple instructions, helpful steps, and safety.
3. Keep the tone enthusiastic but polite, appropriate for a global sports event.
4. Keep the response concise, under 3 paragraphs, formatted cleanly with Markdown, list elements, or bolding.
5. If the user asks general or out-of-stadium questions, politely pivot them back to stadium logistics, World Cup matches, or transportation.`;

    const contents = [];
    // Feed prior history if provided
    for (const msg of chatHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }
    // Append current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini assistance error:", error);
    res.status(500).json({ error: error.message || "Failed to call GenAI Assistant" });
  }
});

// 6. GenAI Operations Summary Brief (Analyses Live telemetry & Crowd parameters)
app.post("/api/gemini/metrics-summary", async (req, res) => {
  const { stadium, attendance, sectorDensities, gateWaits, transitDelays } = req.body;

  const selectedStadium = stadium || "MetLife Stadium";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    setTimeout(() => {
      return res.json({
        summary: `[Simulated Operational Assessment] **Live Briefing for ${selectedStadium}**:
* **Attendance Level**: **${attendance?.toLocaleString() || "N/A"} fans** (high-density crowd flow).
* **Gate Conditions**: Gate queues are experiencing standard bottlenecks with average wait times of ${gateWaits?.["Gate A"] || 15} minutes.
* **Transit Status**: Transportation routes are running smoothly. Transit delays average ${transitDelays?.train || 10} minutes.
* **Commander Advisory**: Maintain active volunteer placement at Gate A, monitor South sector exit patterns, and promote recycling composting programs.`,
        isMock: true
      });
    }, 1000);
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `Provide an executive, high-efficiency AI Commander's briefing summary based on the following real-time stadium metrics at **${selectedStadium}**:

1. Attendance: ${attendance}
2. Sector Densities (Scale 1-100%):
   - North: ${sectorDensities?.North}%
   - South: ${sectorDensities?.South}%
   - East: ${sectorDensities?.East}%
   - West: ${sectorDensities?.West}%
3. Gate Queue Wait Times:
   - North Gate: ${gateWaits?.["North Gate"] || "15"} minutes
   - South Gate: ${gateWaits?.["South Gate"] || "10"} minutes
   - East Gate: ${gateWaits?.["East Gate"] || "12"} minutes
   - West Gate: ${gateWaits?.["West Gate"] || "22"} minutes
4. Public Transit Delays:
   - Commuter Rail / Shuttles: ${transitDelays?.train} mins delay
   - Rideshare Pickup: ${transitDelays?.rideshare} mins delay

Produce a brief, professional briefing in Markdown format with exactly three clear sections:
- **Crowd & Sector Dynamics**: Analyze if certain sectors are near critical density (above 80%), and outline crowd dispersion instructions.
- **Queue & Transit Optimization**: Suggest actionable dispatch changes or announcements to balance gate loads.
- **Sustainability & Accessibility Alert**: Remind coordinators to dispatch wheelchair helper patrols or sustainability sorting checkers to the highest loaded gates.

Be highly analytical, concise, and professional. Avoid fluffy words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the FIFA World Cup 2026 Advanced Operational Intelligence Core. Your briefings must optimize fan comfort, logistics, and resource allocation."
      }
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Gemini briefing error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI operational summary" });
  }
});

// Vite Middleware & static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FIFA World Cup 2026 Stadium Hub server running on port ${PORT}`);
  });
}

startServer();
