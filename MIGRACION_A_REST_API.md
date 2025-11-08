# 🚀 Migración de MCP a API REST de GoHighLevel

## ❌ Problema Identificado

El **MCP de GoHighLevel es inestable** y genera muchos errores:
- Respuestas inconsistentes (triple-nested JSON)
- Errores 406 frecuentes
- Timeout en algunas llamadas
- Difícil de debuggear

## ✅ Solución: API REST Oficial

La **API REST de GoHighLevel** es:
- ✅ **Estable y confiable**
- ✅ **Documentada oficialmente**
- ✅ **Más rápida** (sin parsing de JSON anidado)
- ✅ **Fácil de debuggear**
- ✅ **Probada y funcional** (ver test-ghl-api.js)

---

## 📊 Comparación

### Antes (MCP - PROBLEMÁTICO):
```typescript
const response = await callMCPTool(
  'contacts_get-contacts',
  { locationId: getLocationId() },
  user.role,
  user.ghl_user_id
);
// ❌ Triple nested JSON parsing
// ❌ Errores 406 frecuentes
// ❌ Respuestas inconsistentes
```

### Después (REST API - FUNCIONAL):
```typescript
const response = await getContacts({
  assignedTo: user.ghl_user_id
});
// ✅ Respuesta directa y simple
// ✅ Sin errores
// ✅ JSON limpio
```

---

## 🔧 Implementación

### Paso 1: Archivo Creado

Ya creé el nuevo cliente de API REST en:
- **Archivo**: `src/lib/ghl-api.ts`
- **Test**: `test-ghl-api.js` (✅ Probado y funcionando)

### Paso 2: Funciones Disponibles

```typescript
// Obtener contactos
getContacts({ assignedTo?: string, limit?: number })

// Obtener un contacto específico
getContact(contactId: string)

// Obtener oportunidades
getOpportunities({ assignedTo?: string, status?: string })

// Obtener pipelines
getPipelines()

// Obtener tareas de un contacto
getContactTasks(contactId: string)

// Obtener conversaciones
getConversations({ contactId?: string, assignedTo?: string })

// Test de conexión
testGHLConnection()
```

---

## 📝 Plan de Migración

### Archivos a Actualizar (en orden):

1. **src/lib/metrics-service.ts**
   - Reemplazar `callMCPTool` con `getContacts` y `getOpportunities`
   - Eliminar parsing de JSON anidado

2. **src/lib/contact-service.ts**
   - Reemplazar todas las llamadas MCP
   - Usar funciones REST directas

3. **src/lib/automation-service.ts**
   - Migrar detección de hot leads
   - Usar API REST para scoring

4. **src/components/PipelineView.tsx**
   - Migrar a `getOpportunities()`

5. **src/components/DealsAtRisk.tsx**
   - Migrar a `getOpportunities()`

---

## ⚡ Migración Rápida

¿Quieres que migremos **ahora mismo**? Puedo:

### Opción A: Migración Completa (30 min)
- ✅ Migrar todos los servicios
- ✅ Probar cada función
- ✅ Eliminar código MCP antiguo

### Opción B: Migración Gradual (60 min)
- ✅ Migrar solo metrics-service primero
- ✅ Probar que funciona
- ✅ Luego migrar el resto

### Opción C: Solo Fix del Chat IA (5 min)
- ✅ Arreglar el error del modelo de Claude
- ✅ Usar `claude-3-5-sonnet-20241022` correcto

---

## 🐛 Fix del Error del Chat

El error que ves:
```
Edge Function Error: 502 - model: claude-3-5-sonnet-20241022
```

Es porque el Edge Function está usando un modelo antiguo. Necesitamos:

1. Actualizar el Edge Function en Supabase
2. Cambiar a: `claude-3-5-sonnet-20241022` o `claude-sonnet-4-5-20250929`

---

## 📊 Resultados Esperados

### Antes (con MCP):
```
❌ MCP Error: 406
❌ No data in SSE response
❌ Could not parse nested JSON
```

### Después (con REST API):
```
✅ GHL API: Contacts fetched successfully
✅ Count: 147 contacts
✅ GHL API: Opportunities fetched successfully
✅ Count: 20 opportunities
```

---

## 🎯 ¿Qué Prefieres?

Dime qué opción quieres y empezamos **inmediatamente**:

1. **Migración Completa a REST API** - Sin más problemas de MCP
2. **Solo Fix del Chat IA** - Para que funcione el chat
3. **Ambas cosas** - Solución completa

También puedo mostrarte exactamente qué cambios haré en cada archivo antes de hacerlos.

¿Cuál prefieres?
