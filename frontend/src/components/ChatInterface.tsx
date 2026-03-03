// path: /frontend/src/components/ChatInterface.tsx

import { useState, useRef, useEffect } from 'react';
import { Message } from '../types/agent';
import ProgressiveDisclosure from './ProgressiveDisclosure';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isProcessing,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Bienvenido a Aurora</h2>
            <p>Sistema de Inteligencia Clínica Multiagente para Psicólogos</p>
            <div className="features-list">
              <h3>¿Qué puedo hacer por ti?</h3>
              <ul>
                <li>📅 Programar y gestionar citas con pacientes</li>
                <li>📋 Analizar notas clínicas y sesiones</li>
                <li>🔍 Identificar patrones de comportamiento</li>
                <li>💡 Generar insights empíricos basados en evidencia</li>
                <li>⚠️ Evaluar factores de riesgo</li>
                <li>👤 Incorporar nuevos pacientes</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'agent-message'}`}
            >
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? '👨‍⚕️ Psicólogo' : '🤖 Aurora'}
                </span>
                {message.agentName && (
                  <span className="agent-name">{message.agentName}</span>
                )}
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString('es-ES')}
                </span>
              </div>
              <div className="message-content">
                {message.role === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <ProgressiveDisclosure
                    summary={message.content}
                    insights={message.insights}
                    reasoning={message.reasoning}
                  />
                )}
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="message agent-message processing">
            <div className="message-header">
              <span className="message-role">🤖 Aurora</span>
            </div>
            <div className="processing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Procesando tu solicitud...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <textarea
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje aquí... (Ejemplo: 'Necesito analizar las notas de mi sesión con el paciente Juan')"
          disabled={isProcessing}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || isProcessing}
        >
          {isProcessing ? 'Procesando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
