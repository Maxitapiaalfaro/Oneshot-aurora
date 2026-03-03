// path: /frontend/src/pages/api/agents/control.ts

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Next.js API Route: POST /api/agents/control
 * Endpoint para controlar la ejecución de agentes (pausar, detener, modificar)
 */

import { BaseAgent } from '../../../lib/backend/agents/BaseAgent';
import { ExecutionControl } from '../../../lib/backend/types/schemas';

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
    const { sessionId, action, parameters } = req.body;

    if (!sessionId || !action) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: sessionId y action',
      });
    }

    const control: ExecutionControl = {
      sessionId,
      action,
      parameters,
      timestamp: new Date(),
    };

    const baseAgent = getBaseAgent();
    const result = await baseAgent.controlExecution(control);

    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Error controlando ejecución:', error);
    return res.status(500).json({
      error: 'Error al controlar la ejecución',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
