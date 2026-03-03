// path: /backend/src/index.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import agentsRouter from './routes/agents';
import { isDemoMode } from './utils/repositoryFactory';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/agents', agentsRouter);

// Health check
app.get('/health', (_req, res) => {
  const demoMode = isDemoMode();
  res.json({
    status: 'ok',
    service: 'Aurora Backend API',
    version: '1.0.0',
    mode: demoMode ? 'demo' : 'production',
    timestamp: new Date().toISOString(),
    features: {
      persistence: demoMode ? 'in-memory (temporary)' : 'firestore (permanent)',
      authentication: demoMode ? 'disabled' : 'enabled',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    path: req.path,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  const demoMode = isDemoMode();
  console.log('='.repeat(50));
  console.log('🚀 Aurora Backend API');
  console.log('='.repeat(50));
  console.log(`📡 Servidor escuchando en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🤖 Agents API: http://localhost:${PORT}/api/agents`);
  console.log('-'.repeat(50));
  console.log(`🎯 Modo: ${demoMode ? '🎭 DEMO (in-memory)' : '🔥 PRODUCCIÓN (Firestore)'}`);
  if (demoMode) {
    console.log('⚠️  Los datos NO persisten entre reinicios');
    console.log('💡 Para modo producción, configure Firebase en .env');
  }
  console.log('='.repeat(50));
});

export default app;
