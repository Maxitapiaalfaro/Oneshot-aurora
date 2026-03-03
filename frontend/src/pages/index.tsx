// path: /frontend/src/pages/index.tsx

import { useState, useEffect } from 'react';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import ExecutionControls from '../components/ExecutionControls';
import { sendMessage, controlExecution, checkHealth } from '../utils/api';
import { Message, SessionState } from '../types/agent';

export default function Home() {
  const [session, setSession] = useState<SessionState>({
    sessionId: '',
    status: 'idle',
    messages: [],
  });
  const [userId] = useState('demo-user-001'); // En producción, obtener del sistema de autenticación
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Verificar conexión con backend
    checkHealth()
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));
  }, []);

  const handleSendMessage = async (messageText: string) => {
    // Agregar mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      status: 'processing',
      messages: [...prev.messages, userMessage],
    }));

    try {
      const response = await sendMessage(messageText, userId, session.sessionId);

      // Agregar respuesta del agente
      const agentMessage: Message = {
        role: 'agent',
        content: response.response.content,
        timestamp: new Date(),
        insights: response.response.metadata?.insights,
        reasoning: response.response.reasoning,
      };

      setSession((prev) => ({
        sessionId: response.sessionId,
        status: 'idle',
        messages: [...prev.messages, agentMessage],
      }));
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Mostrar mensaje de error
      const errorMessage: Message = {
        role: 'agent',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date(),
      };

      setSession((prev) => ({
        ...prev,
        status: 'idle',
        messages: [...prev.messages, errorMessage],
      }));
    }
  };

  const handleControl = async (
    action: 'pause' | 'resume' | 'stop' | 'modify_parameters',
    parameters?: any
  ) => {
    if (!session.sessionId) {
      return;
    }

    try {
      const response = await controlExecution(session.sessionId, action, parameters);
      
      // Actualizar estado según la acción
      let newStatus: SessionState['status'] = session.status;
      if (action === 'pause') {
        newStatus = 'paused';
      } else if (action === 'resume') {
        newStatus = 'processing';
      } else if (action === 'stop') {
        newStatus = 'idle';
      }

      setSession((prev) => ({
        ...prev,
        status: newStatus,
      }));

      // Mostrar notificación
      alert(response.message);
    } catch (error) {
      console.error('Error al controlar ejecución:', error);
      alert('Error al controlar la ejecución');
    }
  };

  return (
    <>
      <Head>
        <title>Aurora - Inteligencia Clínica para Psicólogos</title>
        <meta name="description" content="Sistema de Inteligencia Clínica Multiagente" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="aurora-icon">✨</span> Aurora
            </h1>
            <p className="app-subtitle">Inteligencia Clínica Multiagente</p>
          </div>
          <div className="header-status">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 En línea' : '🔴 Desconectado'}
            </span>
          </div>
        </header>

        <main className="app-main">
          <div className="dashboard-grid">
            <div className="chat-section">
              <ChatInterface
                messages={session.messages}
                onSendMessage={handleSendMessage}
                isProcessing={session.status === 'processing'}
              />
            </div>

            <div className="controls-section">
              <ExecutionControls
                sessionId={session.sessionId}
                status={session.status}
                onControl={handleControl}
              />

              <div className="info-panel">
                <h3>Información de la Sesión</h3>
                <div className="info-item">
                  <span className="info-label">ID de Sesión:</span>
                  <span className="info-value">
                    {session.sessionId || 'No iniciada'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mensajes:</span>
                  <span className="info-value">{session.messages.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className="info-value">
                    {session.status === 'processing' ? 'Procesando' : 
                     session.status === 'paused' ? 'Pausado' : 
                     session.status === 'completed' ? 'Completado' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>© 2025 Aurora Platform - Sistema de Inteligencia Clínica</p>
          <p className="footer-disclaimer">
            Nota: Aurora es una herramienta de apoyo. Las decisiones clínicas finales 
            siempre deben ser realizadas por profesionales calificados.
          </p>
        </footer>
      </div>
    </>
  );
}
