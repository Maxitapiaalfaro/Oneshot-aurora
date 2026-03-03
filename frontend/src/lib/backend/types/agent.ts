// path: /backend/src/types/agent.ts

/**
 * Tipos TypeScript para el sistema de agentes
 */

export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
  reasoning?: string;
  nextActions?: string[];
}

export interface SubAgentExecution {
  agentName: string;
  task: any;
  response: any;
  executionTime: number;
}

export interface ParallelExecutionResult {
  results: SubAgentExecution[];
  totalTime: number;
  success: boolean;
}
