// path: /backend/src/types/schemas.ts

import { z } from 'zod';

/**
 * Esquemas JSON versionados para comunicación entre agentes
 * Estos contratos estructurados previenen la pérdida de contexto
 * siguiendo el estándar jerárquico de 2025
 */

// Esquema para el mensaje del usuario
export const UserMessageSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  message: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type UserMessage = z.infer<typeof UserMessageSchema>;

// Esquema para la tarea del agente base
export const BaseAgentTaskSchema = z.object({
  taskId: z.string(),
  taskType: z.enum(['administrative', 'clinical_analysis', 'mixed']),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  decomposedSteps: z.array(z.string()),
  assignedAgents: z.array(z.string()),
  createdAt: z.date(),
});

export type BaseAgentTask = z.infer<typeof BaseAgentTaskSchema>;

// Esquema para comunicación con Agente Administrativo
export const AdministrativeTaskSchema = z.object({
  version: z.literal('1.0'),
  taskId: z.string(),
  action: z.enum(['schedule_appointment', 'patient_onboarding', 'data_extraction', 'reminder']),
  parameters: z.object({
    patientId: z.string().optional(),
    patientName: z.string().optional(),
    appointmentDate: z.string().optional(),
    appointmentTime: z.string().optional(),
    notes: z.string().optional(),
    extractionFields: z.array(z.string()).optional(),
  }),
  context: z.string(),
  createdAt: z.date(),
});

export type AdministrativeTask = z.infer<typeof AdministrativeTaskSchema>;

// Esquema para respuesta del Agente Administrativo
export const AdministrativeResponseSchema = z.object({
  version: z.literal('1.0'),
  taskId: z.string(),
  status: z.enum(['completed', 'partial', 'failed']),
  result: z.object({
    summary: z.string(),
    data: z.record(z.any()).optional(),
    nextSteps: z.array(z.string()).optional(),
  }),
  executionTime: z.number(),
  timestamp: z.date(),
});

export type AdministrativeResponse = z.infer<typeof AdministrativeResponseSchema>;

// Esquema para comunicación con Agente de Análisis Clínico
export const ClinicalAnalysisTaskSchema = z.object({
  version: z.literal('1.0'),
  taskId: z.string(),
  action: z.enum(['analyze_notes', 'identify_patterns', 'generate_insights', 'risk_assessment']),
  parameters: z.object({
    patientId: z.string().optional(),
    sessionNotes: z.string().optional(),
    analysisType: z.string().optional(),
    historicalData: z.boolean().optional(),
    confidenceThreshold: z.number().optional(),
  }),
  context: z.string(),
  createdAt: z.date(),
});

export type ClinicalAnalysisTask = z.infer<typeof ClinicalAnalysisTaskSchema>;

// Esquema para respuesta del Agente de Análisis Clínico
export const ClinicalAnalysisResponseSchema = z.object({
  version: z.literal('1.0'),
  taskId: z.string(),
  status: z.enum(['completed', 'partial', 'failed']),
  result: z.object({
    summary: z.string(),
    insights: z.array(z.object({
      category: z.string(),
      finding: z.string(),
      confidence: z.number(),
      reasoning: z.string(),
    })),
    recommendations: z.array(z.string()).optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }),
  executionTime: z.number(),
  timestamp: z.date(),
});

export type ClinicalAnalysisResponse = z.infer<typeof ClinicalAnalysisResponseSchema>;

// Esquema para el estado de la sesión
export const SessionStateSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  currentTask: z.string().optional(),
  status: z.enum(['idle', 'processing', 'paused', 'completed']),
  history: z.array(z.object({
    role: z.enum(['user', 'base_agent', 'sub_agent']),
    content: z.string(),
    timestamp: z.date(),
    agentName: z.string().optional(),
  })),
  metadata: z.record(z.any()).optional(),
});

export type SessionState = z.infer<typeof SessionStateSchema>;

// Esquema para control de ejecución (pausar, detener, modificar)
export const ExecutionControlSchema = z.object({
  sessionId: z.string(),
  action: z.enum(['pause', 'resume', 'stop', 'modify_parameters']),
  parameters: z.record(z.any()).optional(),
  timestamp: z.date(),
});

export type ExecutionControl = z.infer<typeof ExecutionControlSchema>;
