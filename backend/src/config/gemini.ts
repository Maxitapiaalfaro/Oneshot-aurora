// path: /backend/src/config/gemini.ts

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración del cliente Google Genai para los agentes de IA
 */
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export default genAI;
