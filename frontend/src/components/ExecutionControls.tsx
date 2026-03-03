// path: /frontend/src/components/ExecutionControls.tsx

import { useState } from 'react';

interface ExecutionControlsProps {
  sessionId: string | null;
  status: 'idle' | 'processing' | 'paused' | 'completed';
  onControl: (action: 'pause' | 'resume' | 'stop' | 'modify_parameters', parameters?: any) => void;
}

export default function ExecutionControls({
  sessionId,
  status,
  onControl,
}: ExecutionControlsProps) {
  const [showModifyParams, setShowModifyParams] = useState(false);
  const [parameters, setParameters] = useState('');

  const handleModifyParameters = () => {
    try {
      const params = JSON.parse(parameters);
      onControl('modify_parameters', params);
      setShowModifyParams(false);
      setParameters('');
    } catch (error) {
      alert('Error: Formato JSON inválido');
    }
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="execution-controls">
      <div className="controls-header">
        <h3>Controles de Ejecución</h3>
        <span className={`status-badge status-${status}`}>
          Estado: {status === 'processing' ? 'Procesando' : status === 'paused' ? 'Pausado' : status === 'completed' ? 'Completado' : 'Inactivo'}
        </span>
      </div>

      <div className="controls-buttons">
        {status === 'processing' && (
          <>
            <button
              className="control-button pause-button"
              onClick={() => onControl('pause')}
            >
              ⏸️ Pausar Análisis
            </button>
            <button
              className="control-button stop-button"
              onClick={() => onControl('stop')}
            >
              ⏹️ Detener
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              className="control-button resume-button"
              onClick={() => onControl('resume')}
            >
              ▶️ Reanudar
            </button>
            <button
              className="control-button stop-button"
              onClick={() => onControl('stop')}
            >
              ⏹️ Detener
            </button>
          </>
        )}

        <button
          className="control-button modify-button"
          onClick={() => setShowModifyParams(!showModifyParams)}
        >
          ⚙️ Modificar Parámetros
        </button>
      </div>

      {showModifyParams && (
        <div className="modify-params-section">
          <h4>Modificar Parámetros</h4>
          <p className="param-help">Ingresa parámetros en formato JSON:</p>
          <textarea
            className="param-input"
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
            placeholder='{"confidenceThreshold": 0.8, "analysisType": "detailed"}'
            rows={4}
          />
          <div className="param-buttons">
            <button
              className="control-button apply-button"
              onClick={handleModifyParameters}
            >
              Aplicar
            </button>
            <button
              className="control-button cancel-button"
              onClick={() => {
                setShowModifyParams(false);
                setParameters('');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
