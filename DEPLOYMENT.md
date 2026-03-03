# Guía de Despliegue - Aurora Platform

Esta guía cubre el despliegue de Aurora en modo Demo (Zero-Config) y modo Producción.

## 🎭 Modo Demo - Despliegue en Vercel (Zero-Config)

El Modo Demo permite ejecutar Aurora usando **SOLO** `GEMINI_API_KEY`, sin necesidad de configurar Firebase. Los datos se almacenan en memoria durante la sesión.

### Características del Modo Demo
- ✅ Sin configuración de base de datos
- ✅ Despliegue inmediato en Vercel
- ✅ Todas las funcionalidades multiagente operativas
- ✅ Interfaz UI/UX completa en español
- ⚠️ Los datos NO persisten entre reinicios
- ⚠️ Solo para demostración y desarrollo

### Pasos para Desplegar en Vercel

#### 1. Preparar el Repositorio

Asegúrate de que tu código esté en GitHub y actualizado:

```bash
git add .
git commit -m "Preparar para deployment en Vercel"
git push origin main
```

#### 2. Crear Cuenta en Vercel

- Ve a [vercel.com](https://vercel.com)
- Regístrate con tu cuenta de GitHub
- Autoriza a Vercel a acceder a tus repositorios

#### 3. Importar Proyecto

1. Haz clic en **"New Project"**
2. Selecciona el repositorio `Oneshot-aurora`
3. Vercel detectará automáticamente que es un proyecto Next.js

#### 4. Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `GEMINI_API_KEY` | tu-api-key-aquí | **REQUERIDO** - Tu clave API de Google Gemini |

**IMPORTANTE**: NO agregues las variables de Firebase para Modo Demo.

#### 5. Configurar Build Settings

Vercel debería detectar automáticamente la configuración, pero verifica:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

#### 6. Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que el build termine (2-5 minutos)
3. Una vez completado, obtendrás una URL como `https://aurora-xxxxx.vercel.app`

#### 7. Verificar el Despliegue

Visita tu URL y agrega `/api/health`:

```
https://aurora-xxxxx.vercel.app/api/health
```

Deberías ver una respuesta como:

```json
{
  "status": "ok",
  "service": "Aurora Multi-Agent System",
  "version": "1.0.0",
  "mode": "demo",
  "features": {
    "persistence": "in-memory (temporary)",
    "authentication": "disabled"
  }
}
```

Si `"mode": "demo"`, ¡todo está correcto! 🎉

### Obtener tu API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"**
4. Copia la clave y agrégala a las Environment Variables en Vercel

---

## 🔥 Modo Producción - Con Firebase

El Modo Producción utiliza Google Cloud Firestore para persistencia permanente y autenticación.

### Características del Modo Producción
- ✅ Persistencia permanente en Firestore
- ✅ Autenticación de usuarios
- ✅ Datos seguros y encriptados
- ✅ Historial clínico completo
- ✅ Escalable para uso profesional

### Prerequisitos

1. **Proyecto de Google Cloud**
   - Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
   - Habilita Firestore Database
   - Habilita Firebase Authentication (opcional)

2. **Service Account de Firebase**
   - En Firebase Console, ve a Project Settings > Service Accounts
   - Haz clic en "Generate new private key"
   - Descarga el archivo JSON

### Configuración de Variables de Entorno

Para modo producción, necesitas configurar:

```bash
# REQUERIDO - API de Gemini
GEMINI_API_KEY=tu-gemini-api-key

# REQUERIDO - Credenciales de Firebase
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu Clave Privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# OPCIONAL
NODE_ENV=production
API_SECRET_KEY=tu-secret-key-para-jwt
```

### Despliegue en Vercel (Modo Producción)

Sigue los mismos pasos que el Modo Demo, pero en el paso 4 agrega TODAS las variables de entorno de Firebase.

**IMPORTANTE**: 
- Al pegar `FIREBASE_PRIVATE_KEY`, asegúrate de incluir las comillas y los `\n`
- Vercel encriptará automáticamente estas credenciales

### Verificar Modo Producción

Después del despliegue, visita `/api/health`:

```json
{
  "status": "ok",
  "mode": "production",
  "features": {
    "persistence": "firestore (permanent)",
    "authentication": "enabled"
  }
}
```

Si `"mode": "production"`, ¡estás usando Firestore! 🚀

---

## 🏠 Desarrollo Local

### Modo Demo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Maxitapiaalfaro/Oneshot-aurora.git
cd Oneshot-aurora

# 2. Instalar dependencias
npm install

# 3. Configurar .env (SOLO Gemini)
cp .env.example .env
# Edita .env y agrega tu GEMINI_API_KEY

# 4. Ejecutar frontend (incluye API routes)
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Modo Producción Local

Sigue los mismos pasos, pero en el paso 3 configura TODAS las variables de Firebase en `.env`.

### Ejecutar Backend Express Separado (Opcional)

Si prefieres ejecutar el backend Express y el frontend por separado:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@google/genai'"

**Solución**: Instala las dependencias del frontend

```bash
cd frontend
npm install
```

### Error: "Firebase not initialized"

**Causa**: Estás intentando usar modo producción sin credenciales de Firebase.

**Solución**: 
- Para Demo Mode: NO configures las variables de Firebase
- Para Producción: Configura correctamente todas las variables de Firebase

### Los datos no persisten en Demo Mode

**Comportamiento esperado**: En Demo Mode, los datos se almacenan en memoria y se pierden al reiniciar.

**Solución**: Usa Modo Producción con Firebase para persistencia permanente.

### Error de CORS en desarrollo local

**Solución**: Asegúrate de que `FRONTEND_URL` en `.env` coincida con tu URL del frontend:

```bash
FRONTEND_URL=http://localhost:3000
```

---

## 📊 Comparación de Modos

| Característica | Demo Mode | Producción |
|----------------|-----------|------------|
| **Configuración requerida** | Solo `GEMINI_API_KEY` | `GEMINI_API_KEY` + Firebase |
| **Persistencia de datos** | En memoria (temporal) | Firestore (permanente) |
| **Tiempo de setup** | < 5 minutos | ~30 minutos |
| **Ideal para** | Demos, desarrollo, pruebas | Uso profesional, clientes reales |
| **Costo** | Gratis (solo API Gemini) | Firebase Spark (gratis) o Blaze |
| **Despliegue en Vercel** | ✅ Inmediato | ✅ Soportado |

---

## 🚀 Próximos Pasos

Después del despliegue exitoso:

1. **Personaliza el UI**: Modifica los componentes en `frontend/src/components`
2. **Agrega más agentes**: Crea nuevos agentes especializados en `backend/src/agents`
3. **Configura dominios**: En Vercel, configura un dominio personalizado
4. **Monitoreo**: Usa Vercel Analytics para monitorear el rendimiento
5. **Backups**: Si usas Firestore, configura backups automáticos

---

## 📞 Soporte

¿Problemas con el despliegue? Abre un issue en GitHub con:
- Logs de error completos
- Modo que estás intentando usar (Demo/Producción)
- Plataforma de despliegue (Vercel/local/otro)

---

**¡Disfruta usando Aurora! 🌟**
