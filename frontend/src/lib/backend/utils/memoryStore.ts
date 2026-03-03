// path: /backend/src/utils/memoryStore.ts

import { IAuroraRepository } from '../types/repository';
import { SessionState } from '../types/schemas';

/**
 * Implementación en memoria del repositorio Aurora
 * Usado en Demo Mode cuando no hay Firebase configurado
 * Los datos NO persisten entre reinicios - solo para demostración
 */
export class MemoryRepository implements IAuroraRepository {
  private sessions: Map<string, SessionState> = new Map();
  private tasks: Map<string, any> = new Map();
  private patients: Map<string, any> = new Map();
  private clinicalSessions: any[] = [];

  async saveSessionState(sessionState: SessionState): Promise<void> {
    this.sessions.set(sessionState.sessionId, {
      ...sessionState,
      // Clonar para evitar referencias mutables
      history: [...sessionState.history],
    });
  }

  async getSessionState(sessionId: string): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    // Retornar copia para evitar mutaciones
    return {
      ...session,
      history: [...session.history],
    };
  }

  async saveCompletedTask(taskId: string, taskData: any): Promise<void> {
    this.tasks.set(taskId, {
      ...taskData,
      completedAt: new Date(),
    });
  }

  async savePatientData(patientId: string, data: any): Promise<void> {
    const existing = this.patients.get(patientId) || {};
    this.patients.set(patientId, { ...existing, ...data });
  }

  async getPatientData(patientId: string): Promise<any | null> {
    return this.patients.get(patientId) || null;
  }

  async saveClinicalNotes(
    sessionId: string,
    patientId: string,
    notes: string,
    analysis?: any
  ): Promise<void> {
    this.clinicalSessions.push({
      id: `clinical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      patientId,
      notes,
      analysis,
      createdAt: new Date(),
    });
  }

  async getPatientClinicalHistory(patientId: string): Promise<any[]> {
    return this.clinicalSessions
      .filter(session => session.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Método de utilidad para limpiar la memoria (útil para testing)
   */
  clear(): void {
    this.sessions.clear();
    this.tasks.clear();
    this.patients.clear();
    this.clinicalSessions = [];
  }

  /**
   * Obtener estadísticas del estado actual (útil para debugging)
   */
  getStats(): {
    sessions: number;
    tasks: number;
    patients: number;
    clinicalSessions: number;
  } {
    return {
      sessions: this.sessions.size,
      tasks: this.tasks.size,
      patients: this.patients.size,
      clinicalSessions: this.clinicalSessions.length,
    };
  }
}
