// path: /backend/src/config/gemini.ts

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración del cliente Google Genai para los agentes de IA
 */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Modelo por defecto - Gemini 2.0 Flash
export const geminiModel = ai.models;

export { ai as genAI };
export default ai;
