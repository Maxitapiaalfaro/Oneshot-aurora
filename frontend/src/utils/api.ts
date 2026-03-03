// path: /frontend/src/utils/api.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function sendMessage(
  message: string,
  userId: string,
  sessionId?: string
) {
  const response = await api.post('/api/agents/message', {
    message,
    userId,
    sessionId,
  });
  return response.data;
}

export async function controlExecution(
  sessionId: string,
  action: 'pause' | 'resume' | 'stop' | 'modify_parameters',
  parameters?: any
) {
  const response = await api.post('/api/agents/control', {
    sessionId,
    action,
    parameters,
  });
  return response.data;
}

export async function checkHealth() {
  const response = await api.get('/health');
  return response.data;
}
