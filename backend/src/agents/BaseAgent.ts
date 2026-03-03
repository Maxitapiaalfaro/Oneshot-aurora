// path: /backend/src/agents/BaseAgent.ts

import { geminiModel } from '../config/gemini';
import { AdministrativeAgent } from './AdministrativeAgent';
import { ClinicalAnalysisAgent } from './ClinicalAnalysisAgent';
import {
  UserMessage,
  SessionState,
  AdministrativeTask,
  ClinicalAnalysisTask,
  ExecutionControl,
} from '../types/schemas';
import { AgentResponse, ParallelExecutionResult, SubAgentExecution } from '../types/agent';
import { FirestoreUtils } from '../utils/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base Agent (Orquestador) - 2025 Hierarchical Standard
 * Responsable de:
 * - Razonamiento de alto nivel
 * - Descomposición de tareas
 * - Planificación adaptativa
 * - Enrutamiento a sub-agentes
 * - Preguntas socráticas para clarificación
 * - Ejecución paralela cuando sea apropiado
 */
export class BaseAgent {
  private administrativeAgent: AdministrativeAgent;
  private clinicalAnalysisAgent: ClinicalAnalysisAgent;

  private readonly systemPrompt = `Eres el Agente Base Orquestador de Aurora, una plataforma de inteligencia clínica para psicólogos.

Tu rol es:
1. Comprender las solicitudes del usuario (psicólogo)
2. Descomponer tareas complejas en pasos manejables
3. Decidir qué sub-agentes deben manejar cada tarea
4. Coordinar la ejecución (secuencial o paralela)
5. Usar preguntas socráticas cuando la solicitud es ambigua

IMPORTANTE: Todas tus respuestas deben ser en ESPAÑOL.

Sub-agentes disponibles:
- Agente_Administrativo: Maneja citas, incorporación de pacientes, recordatorios
- Agente_Analisis_Clinico: Analiza notas clínicas, identifica patrones, evalúa riesgos

Principios de interacción:
1. Si la solicitud es ambigua, haz preguntas socráticas para clarificar
2. Descompón tareas complejas antes de delegar
3. Ejecuta sub-tareas en paralelo cuando sea posible
4. Proporciona transparencia sobre qué agentes estás activando
5. Permite que el usuario pause, detenga o modifique el proceso

Estilo de comunicación:
- Profesional pero accesible
- Transparente sobre tu razonamiento
- Proactivo en pedir clarificaciones
- Empático con el contexto clínico`;

  constructor() {
    this.administrativeAgent = new AdministrativeAgent();
    this.clinicalAnalysisAgent = new ClinicalAnalysisAgent();
  }

  /**
   * Procesar mensaje del usuario con razonamiento de alto nivel
   */
  async processMessage(userMessage: UserMessage): Promise<AgentResponse> {
    try {
      // Obtener o crear sesión
      let sessionState = await this.getOrCreateSession(userMessage.sessionId, userMessage.userId);

      // Agregar mensaje a la historia
      sessionState.history.push({
        role: 'user',
        content: userMessage.message,
        timestamp: new Date(),
      });

      // Actualizar estado a procesando
      sessionState.status = 'processing';
      await FirestoreUtils.saveSessionState(sessionState);

      // Fase 1: Análisis y Planificación (usando preguntas socráticas si es necesario)
      const analysisResult = await this.analyzeRequest(userMessage.message, sessionState);

      // Si se necesita clarificación, devolver pregunta socrática
      if (analysisResult.needsClarification) {
        sessionState.status = 'idle';
        sessionState.history.push({
          role: 'base_agent',
          content: analysisResult.clarificationQuestion || '',
          timestamp: new Date(),
        });
        await FirestoreUtils.saveSessionState(sessionState);

        return {
          content: analysisResult.clarificationQuestion || '',
          metadata: {
            needsClarification: true,
            sessionId: userMessage.sessionId,
          },
          reasoning: analysisResult.reasoning,
        };
      }

      // Fase 2: Descomposición de tareas
      const tasks = await this.decomposeTasks(analysisResult);

      // Fase 3: Ejecución (paralela o secuencial)
      const executionResult = await this.executeTasks(tasks);

      // Fase 4: Síntesis de resultados
      const response = await this.synthesizeResults(executionResult, userMessage.message);

      // Actualizar sesión
      sessionState.status = 'completed';
      sessionState.history.push({
        role: 'base_agent',
        content: response.content,
        timestamp: new Date(),
      });
      await FirestoreUtils.saveSessionState(sessionState);

      return response;
    } catch (error) {
      console.error('Error en BaseAgent:', error);
      return {
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        metadata: {
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
      };
    }
  }

  /**
   * Analizar solicitud del usuario y determinar si necesita clarificación
   */
  private async analyzeRequest(
    message: string,
    sessionState: SessionState
  ): Promise<{
    needsClarification: boolean;
    clarificationQuestion?: string;
    taskType?: 'administrative' | 'clinical_analysis' | 'mixed';
    reasoning?: string;
  }> {
    const prompt = `${this.systemPrompt}

Analiza la siguiente solicitud del psicólogo y determina:

1. ¿Es suficientemente clara o necesita clarificación?
2. Si es clara, ¿qué tipo de tarea es? (administrativa, análisis_clínico, mixta)
3. Si necesita clarificación, formula una pregunta socrática en español para obtener más información

Solicitud: "${message}"

Contexto de la sesión: ${sessionState.history.length} mensajes previos.

Responde en formato JSON con: needsClarification (boolean), clarificationQuestion (string, opcional), taskType (string, opcional), reasoning (string)

Devuelve SOLO el JSON, sin texto adicional.`;

    const result = await geminiModel.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    const responseText = result.text || '';
    
    // Extraer JSON del texto
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback si no se puede parsear
    return {
      needsClarification: false,
      taskType: 'mixed',
      reasoning: 'No se pudo analizar la solicitud completamente',
    };
  }

  /**
   * Descomponer la tarea en sub-tareas
   */
  private async decomposeTasks(
    analysisResult: any
  ): Promise<Array<{ type: 'administrative' | 'clinical'; details: any }>> {
    const prompt = `${this.systemPrompt}

Descompón la siguiente tarea en sub-tareas específicas:

Tipo de tarea: ${analysisResult.taskType}
Razonamiento: ${analysisResult.reasoning}

Indica para cada sub-tarea:
1. Tipo (administrative o clinical)
2. Acción específica
3. Parámetros necesarios
4. ¿Puede ejecutarse en paralelo con otras?

Responde en formato JSON con un array de sub-tareas llamado "subtasks".

Devuelve SOLO el JSON, sin texto adicional.`;

    const result = await geminiModel.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    const responseText = result.text || '';
    
    // Extraer JSON del texto
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.subtasks || [];
    }
    
    return [];
  }

  /**
   * Ejecutar tareas (con soporte para ejecución paralela)
   */
  private async executeTasks(
    tasks: Array<{ type: 'administrative' | 'clinical'; details: any }>,
  ): Promise<ParallelExecutionResult> {
    const startTime = Date.now();
    const results: SubAgentExecution[] = [];

    // Identificar tareas que pueden ejecutarse en paralelo
    const parallelTasks = tasks.filter(t => t.details.canRunInParallel);
    const sequentialTasks = tasks.filter(t => !t.details.canRunInParallel);

    // Ejecutar tareas paralelas
    if (parallelTasks.length > 0) {
      const parallelPromises = parallelTasks.map(task => this.executeSubAgentTask(task));
      const parallelResults = await Promise.all(parallelPromises);
      results.push(...parallelResults);
    }

    // Ejecutar tareas secuenciales
    for (const task of sequentialTasks) {
      const result = await this.executeSubAgentTask(task);
      results.push(result);
    }

    const totalTime = Date.now() - startTime;

    return {
      results,
      totalTime,
      success: results.every(r => r.response.status === 'completed'),
    };
  }

  /**
   * Ejecutar tarea de sub-agente
   */
  private async executeSubAgentTask(
    task: { type: 'administrative' | 'clinical'; details: any }
  ): Promise<SubAgentExecution> {
    const startTime = Date.now();
    const taskId = uuidv4();

    let response: any;
    let agentName: string;

    try {
      if (task.type === 'administrative') {
        agentName = 'Agente_Administrativo';
        const adminTask: AdministrativeTask = {
          version: '1.0',
          taskId,
          action: task.details.action,
          parameters: task.details.parameters,
          context: task.details.context || '',
          createdAt: new Date(),
        };
        response = await this.administrativeAgent.executeTask(adminTask);
      } else {
        agentName = 'Agente_Analisis_Clinico';
        const clinicalTask: ClinicalAnalysisTask = {
          version: '1.0',
          taskId,
          action: task.details.action,
          parameters: task.details.parameters,
          context: task.details.context || '',
          createdAt: new Date(),
        };
        response = await this.clinicalAnalysisAgent.executeTask(clinicalTask);
      }

      const executionTime = Date.now() - startTime;

      return {
        agentName,
        task,
        response,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        agentName: task.type === 'administrative' ? 'Agente_Administrativo' : 'Agente_Analisis_Clinico',
        task,
        response: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        executionTime,
      };
    }
  }

  /**
   * Sintetizar resultados de múltiples sub-agentes
   */
  private async synthesizeResults(
    executionResult: ParallelExecutionResult,
    originalMessage: string
  ): Promise<AgentResponse> {
    const resultsText = executionResult.results
      .map(
        r =>
          `${r.agentName}: ${r.response.result?.summary || r.response.error || 'Completado'} (${r.executionTime}ms)`
      )
      .join('\n\n');

    const prompt = `${this.systemPrompt}

Sintetiza los siguientes resultados en una respuesta coherente y útil para el psicólogo:

Solicitud original: "${originalMessage}"

Resultados de sub-agentes:
${resultsText}

Tiempo total de ejecución: ${executionResult.totalTime}ms

Proporciona:
1. Un resumen claro en español
2. Próximos pasos recomendados
3. Cualquier información importante que requiera atención

Mantén un tono profesional y empático.`;

    const result = await geminiModel.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    const synthesizedResponse = result.text || '';

    return {
      content: synthesizedResponse,
      metadata: {
        executionTime: executionResult.totalTime,
        agentsInvolved: executionResult.results.map(r => r.agentName),
        success: executionResult.success,
      },
      reasoning: `Procesado utilizando ${executionResult.results.length} sub-agentes en ${executionResult.totalTime}ms`,
      nextActions: this.extractNextActions(executionResult),
    };
  }

  /**
   * Extraer próximas acciones de los resultados
   */
  private extractNextActions(executionResult: ParallelExecutionResult): string[] {
    const actions: string[] = [];

    for (const result of executionResult.results) {
      if (result.response.result?.nextSteps) {
        actions.push(...result.response.result.nextSteps);
      }
    }

    return [...new Set(actions)]; // Eliminar duplicados
  }

  /**
   * Controlar ejecución (pausar, detener, modificar)
   */
  async controlExecution(control: ExecutionControl): Promise<{ success: boolean; message: string }> {
    const sessionState = await FirestoreUtils.getSessionState(control.sessionId);

    if (!sessionState) {
      return {
        success: false,
        message: 'Sesión no encontrada',
      };
    }

    switch (control.action) {
      case 'pause':
        sessionState.status = 'paused';
        await FirestoreUtils.saveSessionState(sessionState);
        return {
          success: true,
          message: 'Análisis pausado. Puedes reanudarlo cuando desees.',
        };

      case 'resume':
        sessionState.status = 'processing';
        await FirestoreUtils.saveSessionState(sessionState);
        return {
          success: true,
          message: 'Análisis reanudado.',
        };

      case 'stop':
        sessionState.status = 'idle';
        await FirestoreUtils.saveSessionState(sessionState);
        return {
          success: true,
          message: 'Análisis detenido.',
        };

      case 'modify_parameters':
        if (sessionState.metadata) {
          sessionState.metadata = { ...sessionState.metadata, ...control.parameters };
        } else {
          sessionState.metadata = control.parameters;
        }
        await FirestoreUtils.saveSessionState(sessionState);
        return {
          success: true,
          message: 'Parámetros modificados exitosamente.',
        };

      default:
        return {
          success: false,
          message: 'Acción no reconocida',
        };
    }
  }

  /**
   * Obtener o crear sesión
   */
  private async getOrCreateSession(sessionId: string, userId: string): Promise<SessionState> {
    let sessionState = await FirestoreUtils.getSessionState(sessionId);

    if (!sessionState) {
      sessionState = {
        sessionId,
        userId,
        status: 'idle',
        history: [],
      };
      await FirestoreUtils.saveSessionState(sessionState);
    }

    return sessionState;
  }
}
