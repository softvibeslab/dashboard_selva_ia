# 🚀 Configuración de Variables de Entorno en Netlify

Este documento explica cómo configurar todas las variables de entorno necesarias para el Dashboard Selvadentro IA en Netlify.

## 📋 Variables Necesarias

### ✅ OBLIGATORIAS (El dashboard no funciona sin estas)

```bash
# Supabase
VITE_SUPABASE_URL=https://qcvioktwdqcnizvqzekm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8

# GoHighLevel
VITE_GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImNyTjJJaEF1T0JBbDdEODMyNHlJIiwidmVyc2lvbiI6MSwiaWF0IjoxNzQ5OTY5Njg5MjkxLCJzdWIiOiJnRFhtNHJJQjZJbjhxa3Q1dXpKWSJ9.HKfmsDYjb30fxRu6n40R39ED-NEuoWYhJjKvGtxjeUg
VITE_GHL_ACCESS_TOKEN=pit-84d7687f-d43f-4434-9804-c671c669dd0f
VITE_GHL_LOCATION_ID=crN2IhAuOBAl7D8324yI
```

### ⚠️ RECOMENDADAS (Para funcionalidad completa)

```bash
# Anthropic/Claude AI (para el Chat IA)
VITE_ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
```

---

## 🔧 Cómo Configurar en Netlify

### Método 1: Interfaz Web (Recomendado)

1. **Ir a tu sitio en Netlify**
   - Abre https://app.netlify.com/
   - Selecciona tu sitio: `luminous-kulfi-a613c7`

2. **Acceder a Environment Variables**
   - Click en **"Site settings"** (en el menú superior)
   - En el menú lateral, click en **"Environment variables"**
   - O busca directamente: **"Environment variables"** en la barra de búsqueda

3. **Agregar Variables**
   - Click en **"Add a variable"** o **"Add environment variable"**
   - Agrega cada variable **una por una**:
     - **Key**: El nombre de la variable (ej: `VITE_SUPABASE_URL`)
     - **Value**: El valor correspondiente (copia desde arriba)
     - Selecciona **"Same value for all deploys"**
     - Click **"Create variable"**

4. **Repetir para todas las variables**
   - Agrega las 5 variables obligatorias
   - Opcionalmente, agrega la de Anthropic si tienes la API key

5. **Redesplegar**
   - Ve a **"Deploys"** (menú superior)
   - Click en **"Trigger deploy"** → **"Clear cache and deploy site"**
   - Espera 2-3 minutos

---

### Método 2: Netlify CLI (Avanzado)

Si tienes Netlify CLI instalado:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Ir al directorio del proyecto
cd dashboard_selva_ia

# Configurar variables
netlify env:set VITE_SUPABASE_URL "https://qcvioktwdqcnizvqzekm.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8"
netlify env:set VITE_GHL_API_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImNyTjJJaEF1T0JBbDdEODMyNHlJIiwidmVyc2lvbiI6MSwiaWF0IjoxNzQ5OTY5Njg5MjkxLCJzdWIiOiJnRFhtNHJJQjZJbjhxa3Q1dXpKWSJ9.HKfmsDYjb30fxRu6n40R39ED-NEuoWYhJjKvGtxjeUg"
netlify env:set VITE_GHL_ACCESS_TOKEN "pit-84d7687f-d43f-4434-9804-c671c669dd0f"
netlify env:set VITE_GHL_LOCATION_ID "crN2IhAuOBAl7D8324yI"
netlify env:set VITE_ANTHROPIC_API_KEY "tu-api-key-aqui"

# Redesplegar
netlify deploy --prod
```

---

## 🔐 Obtener API Key de Anthropic (Claude AI)

Si necesitas configurar el Chat IA:

1. **Ir a Anthropic Console**
   - https://console.anthropic.com/

2. **Crear cuenta o iniciar sesión**

3. **Obtener API Key**
   - Ve a **"API Keys"**
   - Click en **"Create Key"**
   - Copia la key (empieza con `sk-ant-`)
   - **Importante**: Guárdala en un lugar seguro, no se puede recuperar

4. **Agregar a Netlify**
   - Variable: `VITE_ANTHROPIC_API_KEY`
   - Value: `sk-ant-tu-api-key-copiada`

---

## ✅ Verificar Configuración

Después de redesplegar:

1. **Abrir el Dashboard**
   - https://luminous-kulfi-a613c7.netlify.app/

2. **Abrir Consola del Navegador** (F12)
   - Ve a la pestaña **"Console"**
   - Busca el mensaje: `Supabase Config: {url: '...', hasKey: true}`
   - Verifica que la URL sea correcta

3. **Probar Login**
   - Ingresa cualquier email de los usuarios creados
   - Ejemplo: `mmolina@selvadentrotulum.com`

4. **Verificar GoHighLevel**
   - Los errores 406 de `services.leadconnectorhq.com/mcp/` deberían desaparecer
   - Deberías ver métricas reales en el Executive Dashboard

5. **Probar Chat IA** (si configuraste Anthropic)
   - Ve a la sección **"Chat IA"**
   - Envía un mensaje de prueba
   - Deberías recibir respuesta del asistente

---

## 🐛 Troubleshooting

### Error: Variables no se aplican después de agregarlas

**Solución**: Hacer un redeploy limpio
- Deploys → Trigger deploy → **"Clear cache and deploy site"**

### Error: "Supabase URL undefined"

**Solución**: Verificar que el nombre de la variable sea exacto
- Debe ser `VITE_SUPABASE_URL` (no `SUPABASE_URL`)
- Las variables DEBEN empezar con `VITE_` para que Vite las reconozca

### Error 406 de GoHighLevel persiste

**Solución**: Verificar credenciales
- Ir a GoHighLevel → Settings → API
- Regenerar API Key si es necesario
- Verificar que el Location ID sea correcto

### Chat IA no responde

**Posibles causas**:
1. No está configurada `VITE_ANTHROPIC_API_KEY`
2. La API key es inválida o sin créditos
3. La Edge Function `ai-chat` no está desplegada en Supabase

---

## 📊 Resumen de Variables por Funcionalidad

| Funcionalidad | Variables Necesarias | Estado |
|--------------|---------------------|--------|
| **Login/Autenticación** | `VITE_SUPABASE_URL`<br>`VITE_SUPABASE_ANON_KEY` | ✅ Configuradas |
| **Executive Dashboard** | `VITE_GHL_API_KEY`<br>`VITE_GHL_ACCESS_TOKEN`<br>`VITE_GHL_LOCATION_ID` | ✅ Configuradas |
| **Pipeline** | Mismas de GHL | ✅ Configuradas |
| **Chat IA** | `VITE_ANTHROPIC_API_KEY` | ⚠️ Pendiente |
| **Contacts** | Mismas de GHL | ✅ Configuradas |
| **Analytics** | Mismas de GHL | ✅ Configuradas |
| **Reports** | Todas las anteriores | ✅ Configuradas |

---

## 🎯 Próximos Pasos

1. ✅ Agregar las 5 variables obligatorias en Netlify
2. ✅ Redesplegar el sitio
3. ⚠️ Obtener y configurar API key de Anthropic (opcional)
4. ✅ Probar todas las funcionalidades
5. 🎉 Dashboard listo para producción!

---

## 📞 Soporte

Si tienes problemas:
- Revisa los logs en Netlify: Deploys → (tu deploy) → Deploy log
- Revisa la consola del navegador (F12) para errores
- Verifica que todas las variables estén configuradas correctamente
