// path: /frontend/src/types/agent.ts

export interface Insight {
  category: string;
  finding: string;
  confidence: number;
  reasoning: string;
}

export interface AgentResponse {
  content: string;
  metadata?: {
    executionTime?: number;
    agentsInvolved?: string[];
    success?: boolean;
    needsClarification?: boolean;
    sessionId?: string;
  };
  reasoning?: string;
  nextActions?: string[];
}

export interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
  insights?: Insight[];
  reasoning?: string;
}

export interface SessionState {
  sessionId: string;
  status: 'idle' | 'processing' | 'paused' | 'completed';
  messages: Message[];
}
