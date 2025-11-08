# 🔧 ARREGLO: GoHighLevel MCP - Usar Variables de Entorno

## ❌ PROBLEMA ACTUAL

El archivo `src/lib/ghl-mcp.ts` tiene las credenciales de GoHighLevel **HARDCODED** (escritas directamente en el código), por eso **NO está usando las variables de entorno de Netlify**.

**Código actual (INCORRECTO)**:
```typescript
const MCP_ENDPOINT = 'https://services.leadconnectorhq.com/mcp/';
const GHL_TOKEN = 'pit-84d7687f-d43f-4434-9804-c671c669dd0f';  // ❌ HARDCODED
const LOCATION_ID = 'crN2IhAuOBAl7D8324yI';  // ❌ HARDCODED
```

---

## ✅ SOLUCIÓN: Usar Variables de Entorno

Necesitamos cambiar el archivo para que use las variables de Netlify.

### Archivo a editar:
`src/lib/ghl-mcp.ts`

### Cambiar las líneas 1-3:

**ANTES** (líneas 1-3):
```typescript
const MCP_ENDPOINT = 'https://services.leadconnectorhq.com/mcp/';
const GHL_TOKEN = 'pit-84d7687f-d43f-4434-9804-c671c669dd0f';
const LOCATION_ID = 'crN2IhAuOBAl7D8324yI';
```

**DESPUÉS**:
```typescript
const MCP_ENDPOINT = 'https://services.leadconnectorhq.com/mcp/';
const GHL_TOKEN = import.meta.env.VITE_GHL_ACCESS_TOKEN || '';
const LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || '';
const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY || '';
```

### También actualizar el header Authorization (línea 28):

**ANTES** (línea 28):
```typescript
'Authorization': `Bearer ${GHL_TOKEN}`,
```

**DESPUÉS**:
```typescript
'Authorization': `Bearer ${GHL_TOKEN}`,
'X-API-Key': GHL_API_KEY,
```

---

## 📝 CÓDIGO COMPLETO CORREGIDO

Reemplaza TODO el contenido de `src/lib/ghl-mcp.ts` con esto:

```typescript
const MCP_ENDPOINT = 'https://services.leadconnectorhq.com/mcp/';
const GHL_TOKEN = import.meta.env.VITE_GHL_ACCESS_TOKEN || '';
const LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || '';
const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY || '';

export interface MCPRequest {
  tool: string;
  input: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function callMCPTool(tool: string, input: Record<string, any>, userRole: string, userId?: string): Promise<MCPResponse> {
  try {
    const filteredInput = { ...input };

    if (userRole === 'user' && userId) {
      filteredInput.assignedTo = userId;
    }

    console.log('🔑 GHL Config:', {
      endpoint: MCP_ENDPOINT,
      hasToken: !!GHL_TOKEN,
      hasApiKey: !!GHL_API_KEY,
      locationId: LOCATION_ID,
      tool,
    });

    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'X-API-Key': GHL_API_KEY,
        'locationId': LOCATION_ID,
      },
      body: JSON.stringify({
        tool,
        input: filteredInput,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MCP Error:', response.status, errorText);
      return {
        success: false,
        error: `MCP Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ MCP Success:', tool);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ MCP Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const SELVADENTRO_KNOWLEDGE = {
  name: 'Selvadentro Tulum',
  description: 'Desarrollo residencial eco-friendly en Tulum, México',
  features: [
    'Lotes residenciales integrados con selva primaria',
    '9 cenotes naturales dentro del desarrollo',
    'Áreas de wellness y bienestar',
    'Jungle bars temáticos',
    'Gimnasios equipados',
    'Áreas para mascotas',
    'Canchas deportivas',
    'Seguridad 24/7',
  ],
  location: 'Tulum, Quintana Roo, México',
  priceRange: {
    min: 300000,
    max: 2000000,
    currency: 'MXN'
  },
  investment: {
    averageROI: '18% anual',
    appreciation: '+12% anual',
    rentalYield: '8-12% cap rate'
  }
};
```

---

## 🚀 PASOS PARA APLICAR EL ARREGLO

### 1. Editar el archivo

En tu editor de código, abre `src/lib/ghl-mcp.ts` y reemplaza TODO el contenido con el código de arriba.

### 2. Commit y push

```bash
git add src/lib/ghl-mcp.ts
git commit -m "fix: Use environment variables for GoHighLevel MCP credentials"
git push
```

### 3. Redesplegar en Netlify

Netlify detectará el nuevo commit automáticamente y redeployará.

O manualmente:
1. Ve a Netlify → Deploys
2. Trigger deploy → Deploy site

### 4. Esperar 2-3 minutos

### 5. Probar el Dashboard

1. Abre https://luminous-kulfi-a613c7.netlify.app/ (o tu URL de Netlify)
2. Presiona Ctrl+Shift+R para limpiar caché
3. Haz login
4. Abre la consola (F12)
5. **Los errores 406 de GoHighLevel deberían desaparecer**
6. Deberías ver: `✅ GHL Config:` con `hasToken: true`, `hasApiKey: true`

---

## ✅ VERIFICACIÓN

Después del redeploy, en la consola del navegador deberías ver:

```
🔑 GHL Config: {
  endpoint: "https://services.leadconnectorhq.com/mcp/",
  hasToken: true,
  hasApiKey: true,
  locationId: "crN2IhAuOBAl7D8324yI",
  tool: "contacts_get-contacts"
}
✅ MCP Success: contacts_get-contacts
```

**En lugar de**:
```
❌ MCP Error: 406 - Not Acceptable
```

---

## 🐛 SI PERSISTE EL ERROR 406

Si después del cambio sigues viendo error 406:

### Verifica en la consola:

```javascript
console.log({
  token: import.meta.env.VITE_GHL_ACCESS_TOKEN,
  apiKey: import.meta.env.VITE_GHL_API_KEY,
  locationId: import.meta.env.VITE_GHL_LOCATION_ID
});
```

Si sale `undefined`, significa que:
- ❌ No redeployaste después de agregar las variables en Netlify
- ❌ Las variables no tienen el prefijo `VITE_` en Netlify

**Solución**: Verifica que en Netlify las variables sean EXACTAMENTE:
- `VITE_GHL_API_KEY` (no `GHL_API_KEY`)
- `VITE_GHL_ACCESS_TOKEN` (no `GHL_ACCESS_TOKEN`)
- `VITE_GHL_LOCATION_ID` (no `GHL_LOCATION_ID`)

---

## 📊 RESUMEN

**Cambio realizado**:
- ✅ Removidas credenciales hardcoded
- ✅ Agregado uso de variables de entorno
- ✅ Agregado logging para debugging
- ✅ Agregado header X-API-Key adicional

**Resultado esperado**:
- ✅ Sin errores 406 de GoHighLevel
- ✅ Executive Dashboard muestra métricas reales
- ✅ Pipeline funciona correctamente
- ✅ Contacts se cargan sin errores

---

**Siguiente paso**: Ver `CONFIGURACION_SUPABASE_COMPLETA.md` para configurar la Edge Function del Chat IA.
