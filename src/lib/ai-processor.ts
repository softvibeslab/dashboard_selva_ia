import { User } from './supabase';
import { SELVADENTRO_KNOWLEDGE } from './ghl-mcp';

export interface QueryResult {
  response: string;
  queryType: string;
}

export async function processQuery(query: string, user: User): Promise<QueryResult> {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('mejor broker') || lowerQuery.includes('top broker') ||
      lowerQuery.includes('mejor agente') || lowerQuery.includes('ranking') ||
      lowerQuery.includes('mejor vendedor') || lowerQuery.includes('quien es el mejor')) {
    return { response: handleBrokerRankingQuery(user), queryType: 'ranking' };
  }

  if (lowerQuery.includes('lote') || lowerQuery.includes('disponible') || lowerQuery.includes('amenidad')) {
    return { response: handlePropertyQuery(query), queryType: 'propiedades' };
  }

  if (lowerQuery.includes('venta') || lowerQuery.includes('revenue') || lowerQuery.includes('ingreso')) {
    return { response: handleRevenueQuery(user), queryType: 'ventas' };
  }

  if (lowerQuery.includes('lead') || lowerQuery.includes('contacto') || lowerQuery.includes('prospecto')) {
    return { response: handleLeadsQuery(user), queryType: 'leads' };
  }

  if (lowerQuery.includes('oportunidad') || lowerQuery.includes('pipeline') || lowerQuery.includes('deal')) {
    return { response: handleOpportunitiesQuery(user), queryType: 'oportunidades' };
  }

  if (lowerQuery.includes('estadística') || lowerQuery.includes('métrica') || lowerQuery.includes('kpi')) {
    return { response: handleMetricsQuery(user), queryType: 'métricas' };
  }

  return { response: handleGeneralQuery(query), queryType: 'general' };
}

function handlePropertyQuery(query: string): string {
  const info = SELVADENTRO_KNOWLEDGE;

  return `🏡 **Selvadentro Tulum**

**Ubicación**: ${info.location}

**Características Principales**:
${info.features.map(f => `• ${f}`).join('\n')}

**Rango de Inversión**:
• Desde $${(info.priceRange.min / 1000).toFixed(0)}k hasta $${(info.priceRange.max / 1000000).toFixed(1)}M ${info.priceRange.currency}

**Retorno de Inversión**:
• ROI Promedio: ${info.investment.averageROI}
• Plusvalía: ${info.investment.appreciation}
• Cap Rate: ${info.investment.rentalYield}

¿Te gustaría información específica sobre algún lote o zona?`;
}

function handleRevenueQuery(user: User): string {
  if (user.role === 'admin') {
    return `📊 **Reporte de Revenue - Vista Administrativa**

**Total Equipo (Noviembre 2025)**:
• Revenue Cerrado: $3,200,000 MXN
• Pipeline Total: $42,500,000 MXN
• Deals Cerrados: 6
• Tasa de Conversión: 32%

**Top Performers**:
1. Omar Curi - $1,200,000 (2 deals)
2. Mariano Molina - $600,000 (1 deal)
3. Pablo Saracho - $1,400,000 (3 deals)

**Proyección Trimestre**:
• Objetivo Q4: $15,000,000
• Actual: $3,200,000 (21%)
• Proyectado: $12,800,000 (85%)`;
  }

  return `📊 **Tu Reporte de Revenue (${user.full_name})**

**Noviembre 2025**:
• Revenue Cerrado: $600,000 MXN
• Comisiones: $18,000 MXN
• Deals Cerrados: 1

**Pipeline Activo**:
• Valor Total: $16,100,000 MXN
• Weighted Value: $7,200,000 MXN
• Oportunidades: 28

**Proyección 30 días**:
• Deals Esperados: 2-3
• Revenue Proyectado: $1,200,000 - $1,800,000
• Probabilidad: 75%

¡Excelente trabajo! Continúa así para alcanzar tu meta trimestral.`;
}

function handleLeadsQuery(user: User): string {
  if (user.role === 'admin') {
    return `👥 **Reporte de Leads - Vista Administrativa**

**Total Equipo**:
• Leads Activos: 156
• Nuevos (7 días): 42
• Score Promedio: 7.2/10

**Por Estado**:
• 🔥 Hot: 38 leads
• ⚡ Warm: 76 leads
• ❄️ Cold: 42 leads

**Por Agente**:
• Omar Curi: 52 leads (avg 8.1)
• Mariano Molina: 47 leads (avg 6.8)
• Pablo Saracho: 57 leads (avg 7.3)

**Acción Requerida**:
• 18 leads sin contactar >24h
• 12 leads hot sin reunión agendada`;
  }

  return `👥 **Tus Leads (${user.full_name})**

**Total**: 47 leads asignados

**Por Estado**:
• 🔥 Hot (score 8-10): 12 leads
• ⚡ Warm (score 5-7): 23 leads
• ❄️ Cold (score 1-4): 12 leads

**Score Promedio**: 6.8/10

**Actividad Reciente**:
• Contactados hoy: 8
• Reuniones agendadas: 3
• Propuestas enviadas: 2

**Acción Prioritaria**:
• 5 leads hot requieren seguimiento inmediato
• 3 leads sin contactar >24h

Tip: Enfócate primero en los leads con score >7`;
}

function handleOpportunitiesQuery(user: User): string {
  if (user.role === 'admin') {
    return `💼 **Pipeline de Oportunidades - Equipo Completo**

**Total**: 89 oportunidades | $42.5M

**Por Etapa**:
• Calificado: 32 ($12M)
• Presentación: 24 ($10M)
• Visita: 15 ($8M)
• Propuesta: 10 ($6M)
• Negociación: 6 ($4.5M)
• Contrato: 2 ($2M)

**Conversión Promedio**: 32%
**Tiempo Prom. Cierre**: 42 días

**Deals Críticos** (>15 días en negociación):
• 4 oportunidades por $3.2M
• Acción inmediata requerida`;
  }

  return `💼 **Tu Pipeline (${user.full_name})**

**Total**: 28 oportunidades | $16.1M

**Por Etapa**:
• Prospecto Calificado: 12 ($6.0M)
• Presentación: 8 ($4.0M)
• Visita Realizada: 5 ($2.5M)
• Propuesta Enviada: 3 ($1.8M)
• Negociación: 2 ($1.2M) 🔥
• Contrato Enviado: 1 ($600K) ⭐

**Velocidad Promedio**: 42.5 días ✅

**Prioridad ALTA**:
• 2 deals en negociación >14 días
• Acción: Cerrar esta semana`;
}

function handleMetricsQuery(user: User): string {
  return `📈 **KPIs de ${user.full_name}**

**Noviembre 2025 (hasta hoy)**:

**Actividad**:
• Llamadas: 132 (26/día promedio)
• Tasa de conexión: 45% ✅
• Reuniones: 13 agendadas | 11 completadas
• Show-up rate: 85% ⭐

**Conversión**:
• Lead → Oportunidad: 60% ✅
• Oportunidad → Deal: En proceso
• Tiempo de respuesta: <5 min ⭐

**Revenue**:
• Cerrado: $600,000
• Pipeline: $16,100,000
• Weighted: $7,200,000

**Comparación con Equipo**:
• Ranking: #4 de 5
• Pipeline: 129% vs promedio ⭐
• Velocidad respuesta: Mejor que promedio ✅

Sigue así! Tu pipeline es robusto.`;
}

function handleBrokerRankingQuery(user: User): string {
  if (user.role !== 'admin') {
    return `🏆 **Ranking de Brokers - Noviembre 2025**

Para ver el ranking completo de los brokers y sus estadísticas detalladas, necesitas permisos de administrador.

**Tu Posición**: #4 de 5 brokers activos

**Tu Performance**:
• Revenue Cerrado: $600,000 MXN
• Pipeline Total: $16.1M MXN
• Oportunidades: 28

Si necesitas más detalles sobre tu desempeño, pregunta por tus métricas o estadísticas.`;
  }

  return `🏆 **Ranking de Brokers - Noviembre 2025**

**#1 Pablo Saracho** ⭐
• Revenue Cerrado: $1,400,000 MXN (3 deals)
• Pipeline Activo: $18.2M
• Oportunidades: 34
• Tasa de Conversión: 38% ✅
• Score Promedio Leads: 7.8/10

**#2 Omar Curi** 🥈
• Revenue Cerrado: $1,200,000 MXN (2 deals)
• Pipeline Activo: $15.8M
• Oportunidades: 31
• Tasa de Conversión: 35%
• Score Promedio Leads: 8.1/10

**#3 Mariano Molina** 🥉
• Revenue Cerrado: $600,000 MXN (1 deal)
• Pipeline Activo: $16.1M
• Oportunidades: 28
• Tasa de Conversión: 28%
• Score Promedio Leads: 6.8/10

**#4 Mafer Cienfuegos**
• Revenue Cerrado: $0 (en pipeline)
• Pipeline Activo: $12.4M
• Oportunidades: 22
• Tasa de Conversión: 25%
• Score Promedio Leads: 6.5/10

**#5 Raquel Reyes**
• Revenue Cerrado: $0 (en pipeline)
• Pipeline Activo: $8.9M
• Oportunidades: 18
• Tasa de Conversión: 22%
• Score Promedio Leads: 6.2/10

---

**🌟 Broker del Mes: Pablo Saracho**

**Razones del Reconocimiento**:
✓ Mayor revenue cerrado ($1.4M)
✓ Más deals cerrados (3)
✓ Mayor tasa de conversión (38%)
✓ Mejor velocidad de cierre (38 días promedio)
✓ Pipeline más robusto ($18.2M)

**Premios**:
• Bonus adicional: $42,000 MXN
• Reconocimiento en reunión mensual
• Spotlight en redes sociales del equipo

¡Felicitaciones a todo el equipo por el excelente trabajo este mes! 🎉`;
}

function handleGeneralQuery(query: string): string {
  return `Entiendo tu pregunta sobre "${query}".

Puedo ayudarte con:

**📊 Datos del Negocio**:
• Estadísticas de ventas y revenue
• Información sobre leads y contactos
• Pipeline de oportunidades
• Métricas de performance
• Ranking de brokers

**🏡 Información del Desarrollo**:
• Lotes disponibles en Selvadentro
• Amenidades y características
• Precios y planes de inversión
• ROI y proyecciones

¿Podrías reformular tu pregunta enfocándose en alguno de estos temas?`;
}
