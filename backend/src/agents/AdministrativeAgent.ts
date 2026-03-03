// path: /backend/src/agents/AdministrativeAgent.ts

import { geminiModel } from '../config/gemini';
import {
  AdministrativeTask,
  AdministrativeResponse,
  AdministrativeTaskSchema,
  AdministrativeResponseSchema,
} from '../types/schemas';
import { FirestoreUtils } from '../utils/firestore';

/**
 * Agente_Administrativo - Sub-Agente Especializado
 * Responsable de: programación de citas, incorporación de pacientes,
 * extracción de datos administrativos y recordatorios
 */
export class AdministrativeAgent {
  private readonly agentName = 'Agente_Administrativo';
  private readonly systemPrompt = `Eres el Agente Administrativo de Aurora, una plataforma de inteligencia clínica para psicólogos.

Tu rol es manejar todas las tareas administrativas relacionadas con:
- Programación y gestión de citas
- Incorporación de nuevos pacientes
- Extracción de datos administrativos
- Generación de recordatorios

IMPORTANTE: Todas tus respuestas deben ser en ESPAÑOL.

Debes ser:
- Eficiente y preciso en el manejo de datos
- Claro en tus confirmaciones
- Proactivo en identificar información faltante
- Respetuoso con la confidencialidad del paciente

Cuando necesites información adicional, pregunta de manera clara y específica.`;

  /**
   * Ejecutar tarea administrativa
   */
  async executeTask(task: AdministrativeTask): Promise<AdministrativeResponse> {
    const startTime = Date.now();

    try {
      // Validar el esquema de entrada
      AdministrativeTaskSchema.parse(task);

      let result: any;

      switch (task.action) {
        case 'schedule_appointment':
          result = await this.scheduleAppointment(task);
          break;
        case 'patient_onboarding':
          result = await this.patientOnboarding(task);
          break;
        case 'data_extraction':
          result = await this.extractData(task);
          break;
        case 'reminder':
          result = await this.createReminder(task);
          break;
        default:
          throw new Error(`Acción no reconocida: ${task.action}`);
      }

      const executionTime = Date.now() - startTime;

      const response: AdministrativeResponse = {
        version: '1.0',
        taskId: task.taskId,
        status: 'completed',
        result,
        executionTime,
        timestamp: new Date(),
      };

      // Validar el esquema de salida
      return AdministrativeResponseSchema.parse(response);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Error en ${this.agentName}:`, error);

      return {
        version: '1.0',
        taskId: task.taskId,
        status: 'failed',
        result: {
          summary: `Error al procesar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        },
        executionTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Programar una cita
   */
  private async scheduleAppointment(task: AdministrativeTask) {
    const { patientId, patientName, appointmentDate, appointmentTime, notes } = task.parameters;

    // Usar Gemini para generar confirmación y verificar disponibilidad
    const prompt = `${this.systemPrompt}

Necesito programar una cita para ${patientName || 'un paciente'} el ${appointmentDate} a las ${appointmentTime}. Notas adicionales: ${notes || 'ninguna'}. 

Genera una confirmación profesional en español y verifica si hay algún conflicto potencial o información faltante.`;

    const result = await geminiModel.generate(prompt);
    const aiResponse = result.text;

    // Guardar en Firestore
    if (patientId) {
      await FirestoreUtils.savePatientData(patientId, {
        lastAppointment: {
          date: appointmentDate,
          time: appointmentTime,
          notes,
          scheduledAt: new Date(),
        },
      });
    }

    return {
      summary: aiResponse,
      data: {
        appointmentDate,
        appointmentTime,
        patientId,
        patientName,
      },
      nextSteps: [
        'Enviar confirmación al paciente',
        'Agregar recordatorio 24 horas antes',
        'Preparar materiales necesarios para la sesión',
      ],
    };
  }

  /**
   * Incorporación de nuevo paciente
   */
  private async patientOnboarding(task: AdministrativeTask) {
    const { patientName, notes } = task.parameters;

    const prompt = `${this.systemPrompt}

Estoy incorporando un nuevo paciente: ${patientName}. Información adicional: ${notes || 'ninguna'}.

Por favor:
1. Genera una lista de información que necesito recopilar
2. Sugiere documentos necesarios
3. Proporciona un mensaje de bienvenida profesional en español`;

    const result = await geminiModel.generate(prompt);
    const aiResponse = result.text;

    return {
      summary: aiResponse,
      data: {
        patientName,
        onboardingDate: new Date().toISOString(),
      },
      nextSteps: [
        'Recopilar información personal básica',
        'Solicitar documentos de identificación',
        'Completar formularios de consentimiento',
        'Programar primera sesión',
      ],
    };
  }

  /**
   * Extracción de datos
   */
  private async extractData(task: AdministrativeTask) {
    const { extractionFields, notes } = task.parameters;

    const prompt = `${this.systemPrompt}

Del siguiente texto, extrae los campos solicitados: ${extractionFields?.join(', ') || 'todos los datos relevantes'}.

Texto: ${notes || task.context}

Presenta los datos extraídos de forma estructurada y clara en español.`;

    const result = await geminiModel.generate(prompt);
    const extractedData = result.text;

    return {
      summary: extractedData,
      data: {
        extractionFields,
        extractedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Crear recordatorio
   */
  private async createReminder(task: AdministrativeTask) {
    const { patientName, appointmentDate, appointmentTime, notes } = task.parameters;

    const prompt = `${this.systemPrompt}

Genera un recordatorio profesional y amable en español para ${patientName || 'el paciente'} sobre su cita el ${appointmentDate} a las ${appointmentTime}. ${notes ? `Información adicional: ${notes}` : ''}`;

    const result = await geminiModel.generate(prompt);
    const reminderMessage = result.text;

    return {
      summary: reminderMessage,
      data: {
        reminderType: 'appointment',
        scheduledFor: `${appointmentDate} ${appointmentTime}`,
        createdAt: new Date().toISOString(),
      },
      nextSteps: ['Enviar recordatorio por el canal preferido del paciente'],
    };
  }
}
