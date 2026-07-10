export interface Incident {
  id: string;
  timestamp: string;
  stadium: string;
  title: string;
  description: string;
  category: "Crowd Control" | "Medical" | "Facilities" | "Security" | "Transit";
  severity: "Low" | "Medium" | "High" | "Critical";
  resolved: boolean;
  volunteerDispatch: number;
  immediateActions: string[];
  announcement: string;
}

export interface StadiumData {
  city: string;
  capacity: string;
  gates: string[];
  accessibility: {
    ramps: string;
    elevators: string;
    sensoryRooms: string;
    wheelchairSeating: string;
  };
  sustainability: {
    bins: string;
    cups: string;
    ecoGoal: string;
  };
  transportation: {
    train?: string;
    bus?: string;
    shuttle?: string;
    rideshare: string;
    parking?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
