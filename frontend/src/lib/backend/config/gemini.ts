// path: /backend/src/config/gemini.ts

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });
// Also try from parent directory for monorepo setups
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
}

/**
 * Configuración del cliente Google Genai para los agentes de IA
 */
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY no está configurado en las variables de entorno. Por favor, configure esta variable para usar Aurora.');
}

const ai = new GoogleGenAI({ apiKey });

// Modelo por defecto - Gemini 2.0 Flash
export const geminiModel = ai.models;

export { ai as genAI };
export default ai;

