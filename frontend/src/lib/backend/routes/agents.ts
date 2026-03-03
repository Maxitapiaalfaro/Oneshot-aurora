// path: /backend/src/routes/agents.ts

import express, { Request, Response } from 'express';
import { BaseAgent } from '../agents/BaseAgent';
import { UserMessage, ExecutionControl } from '../types/schemas';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const baseAgent = new BaseAgent();

/**
 * POST /api/agents/message
 * Procesar mensaje del usuario a través del sistema de agentes
 */
router.post('/message', async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId, userId, message } = req.body;

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
      metadata: req.body.metadata,
    };

    const response = await baseAgent.processMessage(userMessage);

    res.json({
      success: true,
      sessionId: userMessage.sessionId,
      response,
    });
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    res.status(500).json({
      error: 'Error al procesar el mensaje',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

/**
 * POST /api/agents/control
 * Controlar la ejecución de agentes (pausar, detener, modificar)
 */
router.post('/control', async (req: Request, res: Response): Promise<any> => {
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

    const result = await baseAgent.controlExecution(control);

    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Error controlando ejecución:', error);
    res.status(500).json({
      error: 'Error al controlar la ejecución',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

/**
 * GET /api/agents/health
 * Verificar que el servicio de agentes está funcionando
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Aurora Multi-Agent System',
    version: '1.0.0',
  });
});

export default router;
