# ✅ Verificación del MCP de GoHighLevel

## 🎯 Estado Actual

El servidor de desarrollo está corriendo en: **http://localhost:5173**

## 🔍 Pasos para Verificar

### 1. Abrir la Aplicación en el Navegador

```bash
# El servidor ya está corriendo
# Abre en tu navegador:
http://localhost:5173
```

### 2. Abrir la Consola del Navegador

- **Chrome/Edge**: Presiona `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Presiona `F12` o `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari**: `Cmd+Option+C`

### 3. Verificar las Variables de Entorno

En la consola, deberías ver algo como:

```javascript
🔑 Supabase Config: {
  url: "https://qcvioktwdqcnizvqzekm.supabase.co",
  hasKey: true
}
```

### 4. Hacer Login

Usa uno de estos usuarios de prueba:
- `mmolina@selvadentrotulum.com`
- `admin@selvadentrotulum.com`

### 5. Verificar que el MCP Funciona

Después del login, deberías ver en la consola:

#### ✅ Si funciona correctamente:

```javascript
📊 Obteniendo métricas reales de GHL...
🔑 GHL Config: {
  endpoint: "https://services.leadconnectorhq.com/mcp/",
  hasToken: true,
  hasApiKey: true,
  locationId: "crN2IhAuOBAl7D8324yI",
  tool: "contacts_get-contacts"
}
✅ MCP Success: contacts_get-contacts
📦 SSE MCP Response: { ... contactos reales ... }
✅ Métricas reales obtenidas: { leads: X, opportunities: Y, ... }
```

#### ❌ Si hay errores (lo que queremos evitar):

```javascript
❌ MCP Error: 406 - Not Acceptable
```

### 6. Verificar el Dashboard Ejecutivo

1. El Dashboard Ejecutivo debería cargar automáticamente
2. Deberías ver métricas reales:
   - Leads
   - Oportunidades
   - Revenue
   - Tasa de Conversión
3. Las tarjetas de métricas deben mostrar números reales (no 0)

### 7. Verificar Pipeline

1. Click en "Pipeline" en el menú lateral
2. Deberías ver oportunidades reales organizadas por etapas
3. En la consola deberías ver:

```javascript
🔑 GHL Config: {
  endpoint: "https://services.leadconnectorhq.com/mcp/",
  hasToken: true,
  hasApiKey: true,
  locationId: "crN2IhAuOBAl7D8324yI",
  tool: "opportunities_search-opportunity"
}
✅ MCP Success: opportunities_search-opportunity
```

## 🐛 Troubleshooting

### Si ves "hasToken: false" o "hasApiKey: false"

Significa que las variables de entorno no se están cargando. Verifica:

1. El archivo `.env.local` existe en la raíz del proyecto
2. El servidor de desarrollo está corriendo (`npm run dev`)
3. Recarga la página con `Ctrl+Shift+R` (hard reload)

### Si ves errores 406

Significa que el MCP no está aceptando las credenciales. Verifica:

1. Las credenciales en `.env.local` son correctas
2. El token de acceso no ha expirado
3. El Location ID es correcto

### Si no se cargan métricas

1. Abre la consola y busca mensajes de error
2. Verifica que el usuario tiene `ghl_user_id` en la base de datos
3. Verifica la conexión a internet

## 📊 Archivos Modificados

Todos estos archivos ahora usan `getLocationId()`:

- ✅ `src/lib/ghl-mcp.ts` - Función centralizada
- ✅ `src/lib/contact-service.ts` - 6 llamadas actualizadas
- ✅ `src/lib/metrics-service.ts` - 3 llamadas actualizadas
- ✅ `src/lib/automation-service.ts` - 5 llamadas actualizadas
- ✅ `src/components/PipelineView.tsx` - 1 llamada actualizada
- ✅ `src/components/DealsAtRisk.tsx` - 1 llamada actualizada

## 🚀 Para Desplegar

Una vez verificado que funciona localmente:

```bash
# Construir para producción
npm run build

# El build usará las variables de entorno de Netlify/Docker automáticamente
```

## ✅ Checklist de Verificación

- [ ] Servidor de desarrollo corriendo
- [ ] Página carga sin errores
- [ ] Login funciona
- [ ] Variables de entorno se cargan (`hasToken: true`, `hasApiKey: true`)
- [ ] MCP responde correctamente (sin errores 406)
- [ ] Dashboard Ejecutivo muestra métricas reales
- [ ] Pipeline muestra oportunidades reales
- [ ] No hay errores en la consola

---

**Última actualización**: 2025-11-08
**Estado**: ✅ Arreglo completo implementado
