# 🔄 Flujo de Filtrado por Usuario

## 📊 Cómo funciona el filtrado en el Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO HACE LOGIN                       │
│                  (mmolina@selvadentrotulum.com)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE: Query tabla users                     │
│  SELECT * FROM users WHERE email = 'mmolina@...'            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATOS DEL USUARIO                         │
│  {                                                           │
│    id: "123-abc",                                           │
│    email: "mmolina@selvadentrotulum.com",                   │
│    name: "Maria Molina",                                    │
│    role: "user",  ◄── IMPORTANTE (admin o user)            │
│    ghl_user_id: "vWerQ2MELDsCSFFKxkJQ"  ◄── CLAVE          │
│  }                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               DASHBOARD CARGA MÉTRICAS                       │
│          fetchRealMetrics(user) se ejecuta                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼─────┐              ┌────────▼────────┐
    │   ADMIN   │              │     BROKER      │
    │ role=admin│              │   role=user     │
    └─────┬─────┘              └────────┬────────┘
          │                             │
          ▼                             ▼
┌─────────────────────┐      ┌──────────────────────────┐
│ getContacts({})     │      │ getContacts({            │
│                     │      │   assignedTo: "vWerQ..." │
│ ✅ SIN FILTRO       │      │ })                       │
│ Ve TODOS            │      │                          │
└─────────┬───────────┘      │ ✅ CON FILTRO           │
          │                  │ Ve SOLO SUYOS           │
          │                  └────────┬─────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐      ┌──────────────────────────┐
│ GoHighLevel API     │      │ GoHighLevel API          │
│                     │      │                          │
│ GET /contacts/      │      │ GET /contacts/           │
│ ?locationId=...     │      │ ?locationId=...          │
│                     │      │ &assignedTo=vWerQ...     │
└─────────┬───────────┘      └────────┬─────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐      ┌──────────────────────────┐
│ RESPUESTA:          │      │ RESPUESTA:               │
│ 20 contactos        │      │ 8 contactos              │
│ (TODOS)             │      │ (SOLO ASIGNADOS AL      │
│                     │      │  BROKER)                 │
└─────────┬───────────┘      └────────┬─────────────────┘
          │                           │
          └──────────┬────────────────┘
                     ▼
          ┌──────────────────────┐
          │  DASHBOARD MUESTRA:  │
          │                      │
          │  📊 Leads: X         │
          │  💰 Revenue: $Y      │
          │  📈 Conversion: Z%   │
          │                      │
          │  ✅ DATOS FILTRADOS  │
          │     POR USUARIO      │
          └──────────────────────┘
```

---

## 🔑 Puntos Clave

### 1. **Identificación del Usuario**
```typescript
const isAdmin = user.role === 'admin';
const userId = user.ghl_user_id;  // ID del usuario en GHL
```

### 2. **Construcción de Parámetros**
```typescript
// ADMIN
const params = {};  // Sin filtro

// BROKER
const params = {
  assignedTo: "vWerQ2MELDsCSFFKxkJQ"  // Solo sus datos
};
```

### 3. **Llamada a API**
```typescript
const response = await getContacts(params);
```

### 4. **Resultado**
```typescript
// ADMIN ve:
{
  contacts: [
    { id: "1", name: "Jessie", assignedTo: "vWerQ2..." },
    { id: "2", name: "Aleks", assignedTo: "jVFC..." },
    { id: "3", name: "Hajar", assignedTo: "NbVU..." },
    // ... 17 más
  ]
}

// BROKER "vWerQ2..." ve:
{
  contacts: [
    { id: "1", name: "Jessie", assignedTo: "vWerQ2..." },
    { id: "4", name: "Jose", assignedTo: "vWerQ2..." },
    { id: "7", name: "Karina", assignedTo: "vWerQ2..." },
    // ... solo los asignados a él
  ]
}
```

---

## 🎯 Ejemplo de Código Real

### Servicio de Métricas (metrics-service.ts)

```typescript
export async function fetchRealMetrics(user: User): Promise<Metrics> {
  const isAdmin = user.role === 'admin';
  const userId = user.ghl_user_id;

  // 1️⃣ Obtener contactos con filtro automático
  const contactsResponse = await getContacts(
    isAdmin ? {} : { assignedTo: userId }
    //         ↑           ↑
    //     Admin ve      Broker ve
    //      TODO         SOLO SUYOS
  );

  const totalLeads = contactsResponse.data?.contacts?.length || 0;

  // 2️⃣ Obtener oportunidades con el mismo filtro
  const oppsResponse = await getOpportunities(
    isAdmin ? {} : { assignedTo: userId }
  );

  const opportunities = oppsResponse.data?.opportunities || [];

  // 3️⃣ Calcular métricas (solo con los datos filtrados)
  const wonDeals = opportunities.filter(o => o.status === 'won').length;
  const totalRevenue = opportunities.reduce((sum, o) =>
    sum + parseFloat(o.monetaryValue || 0), 0
  );

  return {
    leads: totalLeads,           // ✅ Filtrado por usuario
    opportunities: opportunities.length,  // ✅ Filtrado por usuario
    revenue: totalRevenue,       // ✅ Calculado con datos filtrados
    conversion: (wonDeals / totalLeads) * 100,
    loading: false,
  };
}
```

---

## 📈 Comparación de Resultados

### Escenario de Prueba:

**Base de datos GHL tiene**:
- 20 contactos totales
- 8 asignados a broker "vWerQ2..."
- 7 asignados a broker "jVFC..."
- 5 sin asignar

| Usuario | Rol | ghl_user_id | Contactos | Oportunidades |
|---------|-----|-------------|-----------|---------------|
| admin@... | admin | `null` | **20** (todos) | **20** (todas) |
| mmolina@... | user | `vWerQ2...` | **8** (suyos) | **3** (suyas) |
| jgarcia@... | user | `jVFC...` | **7** (suyos) | **4** (suyas) |

---

## ✅ Garantías del Sistema

1. ✅ **Aislamiento de datos**: Cada broker solo ve sus datos
2. ✅ **Visibilidad admin**: Los admin ven todo
3. ✅ **Automático**: El filtro se aplica en la llamada API
4. ✅ **Seguro**: GHL valida los permisos server-side
5. ✅ **Escalable**: Funciona con cualquier número de brokers

---

## 🚀 Ventajas de REST API vs MCP

| Aspecto | MCP | REST API |
|---------|-----|----------|
| Filtrado | ⚠️ Manual y propenso a errores | ✅ Automático y confiable |
| Seguridad | ⚠️ Se puede bypassear | ✅ Validado por GHL |
| Debugging | ❌ Difícil ver qué datos llegan | ✅ Fácil inspeccionar |
| Consistencia | ❌ JSON anidado variable | ✅ Siempre mismo formato |

---

**¿Listo para implementar?** La migración garantiza que cada usuario vea exactamente sus datos, sin riesgos de fugas de información.
