// path: /backend/src/config/firebase.ts

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Inicialización de Firebase Admin SDK (Server-Side Only)
 * Esta configuración garantiza que Firestore solo sea accesible desde el servidor,
 * cumpliendo con la arquitectura de seguridad requerida.
 * 
 * En Demo Mode (sin credenciales de Firebase), esta inicialización se omite
 * y el sistema usa MemoryRepository en su lugar.
 */

const hasFirebaseCredentials = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL;

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (hasFirebaseCredentials) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  db = admin.firestore();
  auth = admin.auth();

  // Configuración de Firestore para optimizar el rendimiento
  db.settings({
    ignoreUndefinedProperties: true,
  });
} else {
  // Demo Mode - crear stubs para evitar errores de importación
  // El repositoryFactory manejará el uso de MemoryRepository
  console.warn('⚠️  Firebase no inicializado - ejecutando en Demo Mode');
}

export { db, auth };
export default admin;
