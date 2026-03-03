// path: /backend/src/utils/firestore.ts

import { db } from '../config/firebase';
import { SessionState } from '../types/schemas';

/**
 * Utilidades para operaciones con Firestore
 * Todas las operaciones son server-side para garantizar seguridad
 */

export class FirestoreUtils {
  /**
   * Guardar el estado de una sesión
   */
  static async saveSessionState(sessionState: SessionState): Promise<void> {
    try {
      await db.collection('sessions').doc(sessionState.sessionId).set({
        ...sessionState,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error guardando estado de sesión:', error);
      throw error;
    }
  }

  /**
   * Obtener el estado de una sesión
   */
  static async getSessionState(sessionId: string): Promise<SessionState | null> {
    try {
      const doc = await db.collection('sessions').doc(sessionId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data() as SessionState;
    } catch (error) {
      console.error('Error obteniendo estado de sesión:', error);
      throw error;
    }
  }

  /**
   * Guardar tarea completada
   */
  static async saveCompletedTask(taskId: string, taskData: any): Promise<void> {
    try {
      await db.collection('tasks').doc(taskId).set({
        ...taskData,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error('Error guardando tarea:', error);
      throw error;
    }
  }

  /**
   * Guardar información del paciente
   */
  static async savePatientData(patientId: string, data: any): Promise<void> {
    try {
      await db.collection('patients').doc(patientId).set(data, { merge: true });
    } catch (error) {
      console.error('Error guardando datos del paciente:', error);
      throw error;
    }
  }

  /**
   * Obtener información del paciente
   */
  static async getPatientData(patientId: string): Promise<any | null> {
    try {
      const doc = await db.collection('patients').doc(patientId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error('Error obteniendo datos del paciente:', error);
      throw error;
    }
  }

  /**
   * Guardar notas de sesión clínica
   */
  static async saveClinicalNotes(
    sessionId: string,
    patientId: string,
    notes: string,
    analysis?: any
  ): Promise<void> {
    try {
      await db.collection('clinical_sessions').add({
        sessionId,
        patientId,
        notes,
        analysis,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error guardando notas clínicas:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de sesiones clínicas de un paciente
   */
  static async getPatientClinicalHistory(patientId: string): Promise<any[]> {
    try {
      const snapshot = await db
        .collection('clinical_sessions')
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo historial clínico:', error);
      throw error;
    }
  }
}
