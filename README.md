# Aurora - Sistema de Inteligencia Clínica Multiagente

Aurora es una plataforma de alta performance de inteligencia clínica multiagente diseñada específicamente para psicólogos. Implementa el estándar jerárquico de 2025 para orquestación de agentes de IA.

## 🌟 Características Principales

### Motor Multiagente Jerárquico (2025 Standard)

- **Base Agent (Orquestador)**: Razonamiento de alto nivel, descomposición de tareas y planificación adaptativa
- **Agente Administrativo**: Gestión de citas, incorporación de pacientes, recordatorios
- **Agente de Análisis Clínico**: Análisis de notas clínicas, identificación de patrones, insights empíricos

### Interfaz de Usuario Transparente

- **Progressive Disclosure UI**: Interfaz por capas que muestra resúmenes de alto nivel con capacidad de profundizar en detalles
- **Preguntas Socráticas**: El sistema guía al psicólogo mediante preguntas clarificadoras en lugar de hacer suposiciones
- **Controles de Ritmo**: Botones para pausar, detener o modificar parámetros del análisis en tiempo real

### Arquitectura de Seguridad

- **Server-Side Only**: Firebase Admin SDK implementado exclusivamente en el backend
- **Zero Client Database Access**: Sin acceso directo a la base de datos desde el cliente
- **Comunicación Estructurada**: Esquemas JSON/Zod versionados para todas las comunicaciones entre agentes

## 🏗️ Arquitectura Técnica

### Backend (Node.js + TypeScript)
- Express.js para API REST
- Firebase Admin para persistencia (Firestore)
- Google Genai para capacidades de IA
- Zod para validación de esquemas
- Ejecución paralela de sub-agentes

### Frontend (Next.js + React + TypeScript)
- Next.js 14 con TypeScript estricto
- Progressive Disclosure Components
- Interfaz 100% en español
- Diseño responsive y accesible

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de Google Cloud con Firestore habilitado
- API Key de Google Gemini

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Maxitapiaalfaro/Oneshot-aurora.git
cd Oneshot-aurora
```

### 2. Instalar dependencias raíz

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 5. Configurar variables de entorno

Copia el archivo `.env.example` y renómbralo a `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Completa las siguientes variables:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu Private Key Aquí\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=tu-service-account@tu-project.iam.gserviceaccount.com

# Google Gemini API
GEMINI_API_KEY=tu-gemini-api-key

# API Configuration
API_PORT=3001
NODE_ENV=development

# Security
API_SECRET_KEY=tu-secret-key-segura
```

## 🎯 Uso

### Modo Desarrollo

Ejecuta backend y frontend simultáneamente:

```bash
# Desde la raíz del proyecto
npm run dev
```

O ejecuta cada servicio por separado:

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

El backend estará disponible en `http://localhost:3001`
El frontend estará disponible en `http://localhost:3000`

### Modo Producción

```bash
# Build
npm run build

# Start
npm start
```

## 🧪 Ejemplos de Uso

### 1. Programar una Cita

```
Usuario: "Necesito programar una cita con el paciente Juan Pérez para el próximo martes a las 15:00"
```

Aurora activará el Agente Administrativo que:
- Verificará disponibilidad
- Creará la confirmación profesional
- Sugerirá recordatorios

### 2. Analizar Notas Clínicas

```
Usuario: "Analiza las siguientes notas: El paciente muestra signos de ansiedad recurrente durante las sesiones..."
```

Aurora activará el Agente de Análisis Clínico que:
- Identificará patrones emocionales
- Generará insights con niveles de confianza
- Proporcionará recomendaciones basadas en evidencia

### 3. Consultas Mixtas

```
Usuario: "Revisa el historial del paciente María y programa una sesión de seguimiento"
```

Aurora orquestará ambos agentes en paralelo para:
- Analizar el historial clínico (Agente Clínico)
- Programar la sesión (Agente Administrativo)
- Sintetizar los resultados en una respuesta coherente

## 🔒 Seguridad y Privacidad

- **NUNCA** incluyas las credenciales de Firebase en el código del cliente
- **NUNCA** expongas las API keys en el frontend
- Todos los datos del paciente se almacenan en Firestore con acceso server-side only
- La comunicación entre frontend y backend está protegida con CORS y Helmet
- Los agentes NO diagnostican - solo proporcionan observaciones y patrones

## 📚 Estructura del Proyecto

```
Oneshot-aurora/
├── backend/
│   ├── src/
│   │   ├── agents/           # Sistema multiagente
│   │   │   ├── BaseAgent.ts
│   │   │   ├── AdministrativeAgent.ts
│   │   │   └── ClinicalAnalysisAgent.ts
│   │   ├── config/           # Configuración
│   │   │   ├── firebase.ts
│   │   │   └── gemini.ts
│   │   ├── routes/           # Endpoints API
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilidades
│   │   └── index.ts          # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ProgressiveDisclosure.tsx
│   │   │   └── ExecutionControls.tsx
│   │   ├── pages/            # Páginas Next.js
│   │   ├── styles/           # Estilos CSS
│   │   ├── types/            # Tipos TypeScript
│   │   └── utils/            # Utilidades
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🤖 Agentes Disponibles

### Base Agent (Orquestador)
- Razonamiento de alto nivel
- Descomposición de tareas
- Enrutamiento inteligente a sub-agentes
- Preguntas socráticas para clarificación
- Ejecución paralela cuando es apropiado

### Agente Administrativo
- Programación de citas
- Incorporación de nuevos pacientes
- Extracción de datos administrativos
- Generación de recordatorios

### Agente de Análisis Clínico
- Análisis de notas de sesión
- Identificación de patrones de comportamiento
- Generación de insights empíricos con niveles de confianza
- Evaluación de factores de riesgo

## 📖 Documentación Técnica

### Comunicación entre Agentes

Todos los agentes se comunican mediante esquemas JSON versionados:

```typescript
// Ejemplo de tarea para Agente Administrativo
{
  version: "1.0",
  taskId: "uuid",
  action: "schedule_appointment",
  parameters: {
    patientName: "Juan Pérez",
    appointmentDate: "2025-03-15",
    appointmentTime: "15:00"
  },
  context: "Sesión de seguimiento",
  createdAt: Date
}
```

### Progressive Disclosure UI

El componente `ProgressiveDisclosure` implementa tres niveles de información:

1. **Nivel 1 (Siempre visible)**: Resumen de alto nivel
2. **Nivel 2 (Expandible)**: Insights detallados con confianza
3. **Nivel 3 (Opcional)**: Razonamiento completo del agente

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Desarrollo (backend + frontend)
npm run build            # Build completo
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend
npm run lint             # Linting
npm run type-check       # Verificación de tipos
```

## ⚠️ Advertencias Importantes

1. Aurora es una herramienta de **apoyo** - las decisiones clínicas finales siempre deben ser realizadas por profesionales calificados
2. El sistema NO diagnostica - solo proporciona observaciones y patrones basados en las notas proporcionadas
3. Mantén siempre la confidencialidad del paciente según las regulaciones aplicables
4. Revisa y valida todos los insights generados por los agentes antes de actuar sobre ellos

## 📄 Licencia

Copyright © 2025 Aurora Platform

## 👥 Contribución

Este es un proyecto de demostración. Para contribuciones, por favor contacta al equipo de desarrollo.

## 📞 Soporte

Para preguntas o soporte, abre un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ para la comunidad de psicólogos de habla hispana**