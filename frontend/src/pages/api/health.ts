// path: /frontend/src/pages/api/health.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { isDemoMode } from '../../lib/backend/utils/repositoryFactory';

/**
 * Next.js API Route: GET /api/health
 * Health check endpoint que también indica el modo de operación
 */

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const demoMode = isDemoMode();

  return res.status(200).json({
    status: 'ok',
    service: 'Aurora Multi-Agent System',
    version: '1.0.0',
    mode: demoMode ? 'demo' : 'production',
    timestamp: new Date().toISOString(),
    features: {
      persistence: demoMode ? 'in-memory (temporary)' : 'firestore (permanent)',
      authentication: demoMode ? 'disabled' : 'enabled',
    },
  });
}
