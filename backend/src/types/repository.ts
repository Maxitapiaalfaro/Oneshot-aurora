// path: /backend/src/types/repository.ts

import { SessionState } from './schemas';

/**
 * Interfaz Repository para abstracción de persistencia
 * Permite cambiar entre Firestore (producción) y MemoryStore (demo)
 * sin modificar la lógica de negocio
 */
export interface IAuroraRepository {
  // Sesiones
  saveSessionState(sessionState: SessionState): Promise<void>;
  getSessionState(sessionId: string): Promise<SessionState | null>;
  
  // Tareas
  saveCompletedTask(taskId: string, taskData: any): Promise<void>;
  
  // Pacientes
  savePatientData(patientId: string, data: any): Promise<void>;
  getPatientData(patientId: string): Promise<any | null>;
  
  // Notas Clínicas
  saveClinicalNotes(
    sessionId: string,
    patientId: string,
    notes: string,
    analysis?: any
  ): Promise<void>;
  getPatientClinicalHistory(patientId: string): Promise<any[]>;
}
