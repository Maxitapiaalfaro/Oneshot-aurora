// path: /frontend/src/components/ProgressiveDisclosure.tsx

import { useState } from 'react';
import { Insight } from '../types/agent';

interface ProgressiveDisclosureProps {
  summary: string;
  insights?: Insight[];
  reasoning?: string;
  nextActions?: string[];
}

export default function ProgressiveDisclosure({
  summary,
  insights,
  reasoning,
  nextActions,
}: ProgressiveDisclosureProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="progressive-disclosure">
      {/* Resumen de alto nivel - siempre visible */}
      <div className="summary-card">
        <h3 className="summary-title">Resumen</h3>
        <p className="summary-text">{summary}</p>
      </div>

      {/* Botón para expandir detalles */}
      <button
        className="disclosure-button"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '▼ Ocultar Detalles' : '▶ Ver Detalles del Análisis'}
      </button>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="details-section">
          {/* Insights */}
          {insights && insights.length > 0 && (
            <div className="insights-container">
              <h4 className="section-title">Insights Clínicos</h4>
              {insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-header">
                    <span className="insight-category">{insight.category}</span>
                    <span className="insight-confidence">
                      Confianza: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="insight-finding">{insight.finding}</p>
                  <details className="insight-reasoning">
                    <summary>Ver razonamiento</summary>
                    <p>{insight.reasoning}</p>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Próximos pasos */}
          {nextActions && nextActions.length > 0 && (
            <div className="next-actions-container">
              <h4 className="section-title">Próximos Pasos Recomendados</h4>
              <ul className="next-actions-list">
                {nextActions.map((action, index) => (
                  <li key={index} className="next-action-item">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Razonamiento del agente */}
          {reasoning && (
            <div className="reasoning-container">
              <button
                className="reasoning-toggle"
                onClick={() => setShowReasoning(!showReasoning)}
              >
                {showReasoning ? '▼ Ocultar Razonamiento del Agente' : '▶ Ver Razonamiento del Agente'}
              </button>
              {showReasoning && (
                <div className="reasoning-content">
                  <p>{reasoning}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
