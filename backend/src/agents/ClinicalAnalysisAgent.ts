// path: /backend/src/agents/ClinicalAnalysisAgent.ts

import { geminiModel } from '../config/gemini';
import {
  ClinicalAnalysisTask,
  ClinicalAnalysisResponse,
  ClinicalAnalysisTaskSchema,
  ClinicalAnalysisResponseSchema,
} from '../types/schemas';
import { FirestoreUtils } from '../utils/firestore';

/**
 * Agente_Analisis_Clinico - Sub-Agente Especializado
 * Responsable de: análisis de notas clínicas, identificación de patrones,
 * generación de insights empíricos y evaluación de riesgos
 */
export class ClinicalAnalysisAgent {
  private readonly agentName = 'Agente_Analisis_Clinico';
  private readonly systemPrompt = `Eres el Agente de Análisis Clínico de Aurora, una plataforma de inteligencia clínica para psicólogos.

Tu rol es proporcionar análisis clínicos profundos y basados en evidencia, incluyendo:
- Análisis de notas de sesiones clínicas
- Identificación de patrones de comportamiento
- Generación de insights empíricos
- Evaluación de riesgos potenciales

IMPORTANTE: Todas tus respuestas deben ser en ESPAÑOL.

Principios que debes seguir:
1. NUNCA diagnostiques - solo proporcionas observaciones y patrones
2. Siempre incluye el nivel de confianza de tus análisis (0.0 a 1.0)
3. Fundamenta tus insights en evidencia específica de las notas
4. Usa terminología clínica apropiada pero comprensible
5. Mantén la confidencialidad absoluta del paciente
6. Sé objetivo y basado en datos

Cuando identifiques algo preocupante, comunícalo con sensibilidad pero claridad.`;

  /**
   * Ejecutar análisis clínico
   */
  async executeTask(task: ClinicalAnalysisTask): Promise<ClinicalAnalysisResponse> {
    const startTime = Date.now();

    try {
      // Validar el esquema de entrada
      ClinicalAnalysisTaskSchema.parse(task);

      let result: any;

      switch (task.action) {
        case 'analyze_notes':
          result = await this.analyzeNotes(task);
          break;
        case 'identify_patterns':
          result = await this.identifyPatterns(task);
          break;
        case 'generate_insights':
          result = await this.generateInsights(task);
          break;
        case 'risk_assessment':
          result = await this.assessRisk(task);
          break;
        default:
          throw new Error(`Acción no reconocida: ${task.action}`);
      }

      const executionTime = Date.now() - startTime;

      const response: ClinicalAnalysisResponse = {
        version: '1.0',
        taskId: task.taskId,
        status: 'completed',
        result,
        executionTime,
        timestamp: new Date(),
      };

      // Guardar análisis en Firestore
      if (task.parameters.patientId) {
        await FirestoreUtils.saveClinicalNotes(
          task.taskId,
          task.parameters.patientId,
          task.parameters.sessionNotes || '',
          result
        );
      }

      // Validar el esquema de salida
      return ClinicalAnalysisResponseSchema.parse(response);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Error en ${this.agentName}:`, error);

      return {
        version: '1.0',
        taskId: task.taskId,
        status: 'failed',
        result: {
          summary: `Error al procesar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          insights: [],
        },
        executionTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Analizar notas de sesión
   */
  private async analyzeNotes(task: ClinicalAnalysisTask) {
    const { sessionNotes, patientId, historicalData } = task.parameters;

    let historicalContext = '';
    if (historicalData && patientId) {
      const history = await FirestoreUtils.getPatientClinicalHistory(patientId);
      if (history.length > 0) {
        historicalContext = `\n\nContexto histórico disponible: ${history.length} sesiones previas.`;
      }
    }

    const prompt = `${this.systemPrompt}

Analiza las siguientes notas de sesión clínica:

${sessionNotes}${historicalContext}

Por favor proporciona:
1. Un resumen de los puntos clave
2. Observaciones sobre el estado emocional y cognitivo
3. Patrones de comportamiento identificados
4. Áreas que requieren atención
5. Nivel de confianza en cada observación (0.0 a 1.0)

Presenta tu análisis de forma estructurada en español.`;

    const result = await geminiModel.generate(prompt);
    const analysis = result.text;

    // Extraer insights estructurados del análisis
    const insights = await this.extractInsights(analysis);

    return {
      summary: analysis,
      insights,
      recommendations: [
        'Continuar monitoreando el progreso del paciente',
        'Considerar técnicas terapéuticas específicas basadas en los patrones identificados',
        'Documentar cambios en futuras sesiones',
      ],
    };
  }

  /**
   * Identificar patrones en el comportamiento del paciente
   */
  private async identifyPatterns(task: ClinicalAnalysisTask) {
    const { patientId, sessionNotes } = task.parameters;

    let historicalData = '';
    if (patientId) {
      const history = await FirestoreUtils.getPatientClinicalHistory(patientId);
      if (history.length > 0) {
        historicalData = history
          .slice(0, 5)
          .map(session => session.notes)
          .join('\n---\n');
      }
    }

    const prompt = `${this.systemPrompt}

Identifica patrones en las siguientes notas clínicas:

Notas recientes:
${sessionNotes}

${historicalData ? `Historial previo:\n${historicalData}` : ''}

Identifica:
1. Patrones de pensamiento recurrentes
2. Patrones emocionales
3. Patrones de comportamiento
4. Cambios a lo largo del tiempo
5. Factores desencadenantes

Proporciona insights con nivel de confianza para cada patrón.`;

    const result = await geminiModel.generate(prompt);
    const analysis = result.text;
    const insights = await this.extractInsights(analysis);

    return {
      summary: analysis,
      insights,
    };
  }

  /**
   * Generar insights empíricos
   */
  private async generateInsights(task: ClinicalAnalysisTask) {
    const { sessionNotes, analysisType } = task.parameters;

    const prompt = `${this.systemPrompt}

Genera insights empíricos ${analysisType ? `enfocados en ${analysisType}` : 'generales'} basados en:

${sessionNotes}

Proporciona insights accionables que ayuden al psicólogo a:
1. Comprender mejor la situación del paciente
2. Identificar áreas de intervención
3. Planificar próximos pasos terapéuticos

Cada insight debe incluir:
- Categoría (ej: cognitivo, emocional, conductual)
- Hallazgo específico
- Nivel de confianza (0.0 a 1.0)
- Razonamiento basado en evidencia`;

    const result = await geminiModel.generate(prompt);
    const analysis = result.text;
    const insights = await this.extractInsights(analysis);

    return {
      summary: analysis,
      insights,
    };
  }

  /**
   * Evaluación de riesgos
   */
  private async assessRisk(task: ClinicalAnalysisTask) {
    const { sessionNotes, patientId } = task.parameters;

    const prompt = `${this.systemPrompt}

Realiza una evaluación de riesgo basada en las siguientes notas:

${sessionNotes}

IMPORTANTE: No diagnostiques. Solo identifica señales de alerta y factores de riesgo.

Evalúa:
1. Indicadores de riesgo inmediato (si los hay)
2. Factores de riesgo a mediano plazo
3. Factores protectores identificados
4. Nivel general de riesgo (low, medium, high, critical)
5. Recomendaciones de seguimiento

Sé específico y fundamenta cada observación.`;

    const result = await geminiModel.generate(prompt);
    const analysis = result.text;
    const insights = await this.extractInsights(analysis);

    // Determinar nivel de riesgo basado en el análisis
    const riskLevel = this.determineRiskLevel(analysis);

    return {
      summary: analysis,
      insights,
      riskLevel,
      recommendations: [
        'Revisar hallazgos con supervisor clínico si es necesario',
        'Documentar evaluación de riesgo',
        'Establecer plan de seguimiento apropiado',
      ],
    };
  }

  /**
   * Extraer insights estructurados del análisis de texto
   */
  private async extractInsights(analysisText: string) {
    const prompt = `Extrae insights estructurados del siguiente análisis clínico. Devuelve un array JSON con objetos que tengan: category, finding, confidence (0.0-1.0), reasoning.

Análisis:
${analysisText}

Devuelve SOLO el JSON, sin texto adicional.`;

    try {
      const result = await geminiModel.generate(prompt);
      const responseText = result.text;
      
      // Intentar extraer JSON del texto
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.insights || [];
      }
      
      // Si no se encuentra JSON válido, devolver insights básicos
      return [
        {
          category: 'general',
          finding: 'Análisis completado',
          confidence: 0.8,
          reasoning: analysisText.substring(0, 200),
        },
      ];
    } catch {
      // Si falla el parsing, devolver insights básicos
      return [
        {
          category: 'general',
          finding: 'Análisis completado',
          confidence: 0.8,
          reasoning: analysisText.substring(0, 200),
        },
      ];
    }
  }

  /**
   * Determinar nivel de riesgo basado en el análisis
   */
  private determineRiskLevel(analysis: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerAnalysis = analysis.toLowerCase();

    if (
      lowerAnalysis.includes('crítico') ||
      lowerAnalysis.includes('inmediato') ||
      lowerAnalysis.includes('urgente')
    ) {
      return 'critical';
    }

    if (lowerAnalysis.includes('alto riesgo') || lowerAnalysis.includes('preocupante')) {
      return 'high';
    }

    if (lowerAnalysis.includes('moderado') || lowerAnalysis.includes('atención')) {
      return 'medium';
    }

    return 'low';
  }
}
