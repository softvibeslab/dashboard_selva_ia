# 🔧 CONFIGURACIÓN COMPLETA DE SUPABASE
# Dashboard Selvadentro IA

Esta guía te lleva paso a paso para configurar Supabase completamente, incluyendo Edge Functions.

---

## 📋 PARTE 1: CONFIGURACIÓN DE BASE DE DATOS (YA HECHO ✅)

Ya completaste esta parte:
- ✅ Tablas creadas (users, user_settings, chat_sessions, chat_messages, chat_history, generated_reports)
- ✅ Políticas RLS configuradas
- ✅ Triggers para sincronización automática
- ✅ 10 usuarios creados

---

## 🚀 PARTE 2: CREAR EDGE FUNCTION `ai-chat`

Las Edge Functions son funciones serverless que corren en Supabase. Necesitamos crear una para el Chat IA.

### Opción A: Crear vía Supabase CLI (Recomendado)

#### 1. Instalar Supabase CLI

**En tu computadora local** (no en el VPS):

```bash
# macOS / Linux
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O con NPM (todas las plataformas)
npm install -g supabase
```

#### 2. Login a Supabase

```bash
supabase login
```

Se abrirá tu navegador para autenticarte.

#### 3. Link a tu proyecto

```bash
# En el directorio de tu proyecto
cd dashboard_selva_ia

# Link al proyecto de Supabase
supabase link --project-ref qcvioktwdqcnizvqzekm
```

Te pedirá la contraseña de la base de datos (la que configuraste en Supabase).

#### 4. Crear la Edge Function

```bash
# Crear función ai-chat
supabase functions new ai-chat
```

Esto creará el archivo: `supabase/functions/ai-chat/index.ts`

#### 5. Copiar el código de la función

Edita `supabase/functions/ai-chat/index.ts` y pega este código:

```typescript
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { model, max_tokens, system, messages, tools } = await req.json();

    console.log('📨 Request received:', { model, systemLength: system?.length, messagesCount: messages?.length });

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const payload: any = {
      model,
      max_tokens,
      messages,
    };

    if (system) {
      payload.system = system;
    }

    if (tools && tools.length > 0) {
      payload.tools = tools;
    }

    console.log('🤖 Calling Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API Error:', response.status, errorText);
      throw new Error(`Anthropic API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Anthropic API Success');

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ Edge Function Error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
```

#### 6. Desplegar la función

```bash
# Setear el API key de Anthropic como secret
supabase secrets set ANTHROPIC_API_KEY=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

# Desplegar la función
supabase functions deploy ai-chat
```

#### 7. Verificar que esté desplegada

```bash
supabase functions list
```

Deberías ver `ai-chat` en la lista.

---

### Opción B: Crear vía Dashboard de Supabase (Alternativa)

Si no puedes usar la CLI:

1. **Ve a Supabase Dashboard**: https://supabase.com/dashboard/project/qcvioktwdqcnizvqzekm

2. **Ve a Edge Functions**:
   - En el menú lateral, click en **"Edge Functions"**

3. **Crear función**:
   - Click en **"Create a new function"**
   - Name: `ai-chat`
   - Click **"Create function"**

4. **Pegar el código**:
   - En el editor, borra todo y pega el código de arriba
   - Click **"Deploy"**

5. **Configurar Secret**:
   - Ve a **Project Settings** → **Edge Functions** → **Secrets**
   - Agregar:
     - Key: `ANTHROPIC_API_KEY`
     - Value: `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`

---

## 🧪 PARTE 3: PROBAR LA EDGE FUNCTION

Desde tu terminal local:

```bash
curl -i --location --request POST 'https://qcvioktwdqcnizvqzekm.supabase.co/functions/v1/ai-chat' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8' \
  --header 'Content-Type: application/json' \
  --data '{"model":"claude-3-5-sonnet-20240620","max_tokens":1024,"messages":[{"role":"user","content":"Hola"}]}'
```

Deberías recibir una respuesta JSON con el texto de Claude.

---

## 📊 PARTE 4: VERIFICAR CONFIGURACIÓN

### Checklist Final:

- [ ] ✅ Base de datos con todas las tablas
- [ ] ✅ Políticas RLS configuradas
- [ ] ✅ 10 usuarios creados
- [ ] ✅ Edge Function `ai-chat` desplegada
- [ ] ✅ Secret `ANTHROPIC_API_KEY` configurado
- [ ] ✅ Prueba de la Edge Function exitosa

---

## 🐛 TROUBLESHOOTING

### Error: "ANTHROPIC_API_KEY not configured"

**Solución**:
```bash
supabase secrets set ANTHROPIC_API_KEY=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
```

### Error: "supabase command not found"

**Solución**: Instala Supabase CLI (ver Parte 2, paso 1)

### Error CORS en el Dashboard

**Solución**: Verifica que la Edge Function tenga los headers CORS correctos (ya están en el código de arriba)

### Edge Function no responde

**Solución**: Ver logs en Supabase Dashboard:
1. Ve a Edge Functions → ai-chat
2. Click en "Logs"
3. Busca errores

---

## 📝 RESUMEN DE CREDENCIALES

**Supabase**:
- Project URL: `https://qcvioktwdqcnizvqzekm.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdmlva3R3ZHFjbml6dnF6ZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjA1OTMsImV4cCI6MjA3ODEzNjU5M30.3qNMsVxCGX8mRkgtz7a1Kilx9CWju6P7VobbPpzy9F8`

**Edge Function Secret**:
- ANTHROPIC_API_KEY: `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`

---

## 🎯 PRÓXIMOS PASOS

Una vez que la Edge Function esté desplegada:

1. ✅ Las variables de entorno ya están en Netlify
2. ✅ El Dashboard ya está desplegado
3. 🔄 Redesplegar Netlify para asegurar que tome todas las variables
4. 🧪 Probar el Chat IA en el Dashboard

---

**¿Listo? Continúa con el archivo: ARREGLO_GHL_MCP.md**
