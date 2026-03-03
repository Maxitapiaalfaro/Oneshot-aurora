// path: /backend/src/utils/repositoryFactory.ts

import { IAuroraRepository } from '../types/repository';
import { MemoryRepository } from './memoryStore';
import { FirestoreRepository } from './firestoreRepository';

/**
 * Factory para crear la instancia de repositorio apropiada
 * basándose en variables de entorno
 */

let repositoryInstance: IAuroraRepository | null = null;

/**
 * Determina si estamos en Demo Mode
 * Demo Mode se activa cuando:
 * 1. DEMO_MODE=true está explícitamente configurado, O
 * 2. No hay credenciales de Firebase configuradas
 */
export function isDemoMode(): boolean {
  // Verificar flag explícito de demo
  if (process.env.DEMO_MODE === 'true') {
    return true;
  }
  
  // Verificar si hay credenciales de Firebase
  const hasFirebaseCredentials = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;
  
  return !hasFirebaseCredentials;
}

/**
 * Obtener la instancia del repositorio (Singleton)
 */
export function getRepository(): IAuroraRepository {
  if (!repositoryInstance) {
    if (isDemoMode()) {
      console.log('🎭 Modo Demo Activado - Usando MemoryRepository');
      console.log('   Los datos NO persisten entre reinicios');
      console.log('   Para modo producción, configure las credenciales de Firebase');
      repositoryInstance = new MemoryRepository();
    } else {
      console.log('🔥 Modo Producción - Usando FirestoreRepository');
      repositoryInstance = new FirestoreRepository();
    }
  }
  
  return repositoryInstance;
}

/**
 * Reiniciar la instancia del repositorio (útil para testing)
 */
export function resetRepository(): void {
  repositoryInstance = null;
}
