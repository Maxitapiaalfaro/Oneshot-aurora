// path: /frontend/src/pages/api/agents/message.ts

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Next.js API Route: POST /api/agents/message
 * Endpoint para procesar mensajes del usuario a través del sistema multiagente
 * 
 * Este endpoint importa y ejecuta la lógica del backend
 * Permite deployment en Vercel sin necesidad de servidor Express separado
 */

// Importar tipos y lógica del backend (copiado localmente para Vercel)
import { BaseAgent } from '../../../lib/backend/agents/BaseAgent';
import { UserMessage } from '../../../lib/backend/types/schemas';
import { v4 as uuidv4 } from 'uuid';

// Instancia única del agente base
let baseAgentInstance: BaseAgent | null = null;

function getBaseAgent(): BaseAgent {
  if (!baseAgentInstance) {
    baseAgentInstance = new BaseAgent();
  }
  return baseAgentInstance;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { sessionId, userId, message, metadata } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: message y userId',
      });
    }

    const userMessage: UserMessage = {
      sessionId: sessionId || uuidv4(),
      userId,
      message,
      timestamp: new Date(),
      metadata,
    };

    const baseAgent = getBaseAgent();
    const response = await baseAgent.processMessage(userMessage);

    return res.status(200).json({
      success: true,
      sessionId: userMessage.sessionId,
      response,
    });
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    return res.status(500).json({
      error: 'Error al procesar el mensaje',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
