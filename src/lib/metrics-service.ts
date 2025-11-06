import { User } from './supabase';
import { callMCPTool } from './ghl-mcp';

export interface Metrics {
  leads: number;
  opportunities: number;
  revenue: number;
  conversion: number;
  loading: boolean;
  error?: string;
}

// Cache para evitar llamadas excesivas a la API
interface CacheEntry {
  data: Metrics;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const metricsCache = new Map<string, CacheEntry>();

/**
 * Obtiene métricas reales de GoHighLevel usando las herramientas MCP
 */
export async function fetchRealMetrics(user: User): Promise<Metrics> {
  const cacheKey = `metrics-${user.id}`;

  // Verificar cache
  const cached = metricsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📊 Usando métricas desde cache');
    return cached.data;
  }

  console.log('📊 Obteniendo métricas reales de GHL...');

  try {
    // Parámetros base según el rol del usuario
    const isAdmin = user.role === 'admin';
    const userId = user.ghl_user_id;

    // 1. Obtener contactos (Leads)
    const contactsResponse = await callMCPTool(
      'contacts_get-contacts',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        ...(isAdmin ? {} : { assignedTo: userId }),
      },
      user.role,
      userId
    );

    const totalLeads = contactsResponse.success && contactsResponse.data?.contacts
      ? contactsResponse.data.contacts.length
      : 0;

    // 2. Obtener oportunidades activas
    const opportunitiesResponse = await callMCPTool(
      'opportunities_search-opportunity',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        ...(isAdmin ? {} : { assignedTo: userId }),
      },
      user.role,
      userId
    );

    const opportunities = opportunitiesResponse.success && opportunitiesResponse.data?.opportunities
      ? opportunitiesResponse.data.opportunities
      : [];

    const totalOpportunities = opportunities.length;

    // 3. Calcular revenue (suma de oportunidades ganadas)
    let totalRevenue = 0;
    let wonOpportunities = 0;

    opportunities.forEach((opp: any) => {
      // Oportunidades ganadas (status = "won" o stage final)
      if (opp.status === 'won' || opp.status === 'closed' || opp.monetaryValue > 0) {
        totalRevenue += parseFloat(opp.monetaryValue || 0);
        wonOpportunities++;
      }
    });

    // 4. Calcular tasa de conversión
    const conversionRate = totalLeads > 0
      ? Math.round((wonOpportunities / totalLeads) * 100)
      : 0;

    const metrics: Metrics = {
      leads: totalLeads,
      opportunities: totalOpportunities,
      revenue: totalRevenue,
      conversion: conversionRate,
      loading: false,
    };

    // Guardar en cache
    metricsCache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now(),
    });

    console.log('✅ Métricas reales obtenidas:', metrics);

    return metrics;
  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error);

    return {
      leads: 0,
      opportunities: 0,
      revenue: 0,
      conversion: 0,
      loading: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Limpia el cache de métricas para forzar una actualización
 */
export function clearMetricsCache(userId?: string) {
  if (userId) {
    metricsCache.delete(`metrics-${userId}`);
  } else {
    metricsCache.clear();
  }
}

/**
 * Obtiene métricas detalladas adicionales (para dashboard ejecutivo)
 */
export async function fetchDetailedMetrics(user: User) {
  console.log('📊 Obteniendo métricas detalladas...');

  try {
    const isAdmin = user.role === 'admin';
    const userId = user.ghl_user_id;

    // Obtener oportunidades para análisis detallado
    const opportunitiesResponse = await callMCPTool(
      'opportunities_search-opportunity',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        ...(isAdmin ? {} : { assignedTo: userId }),
      },
      user.role,
      userId
    );

    const opportunities = opportunitiesResponse.success && opportunitiesResponse.data?.opportunities
      ? opportunitiesResponse.data.opportunities
      : [];

    // Análisis por etapa del pipeline
    const pipelineAnalysis: Record<string, { count: number; value: number }> = {};

    opportunities.forEach((opp: any) => {
      const stage = opp.pipelineStage || opp.status || 'unknown';
      if (!pipelineAnalysis[stage]) {
        pipelineAnalysis[stage] = { count: 0, value: 0 };
      }
      pipelineAnalysis[stage].count++;
      pipelineAnalysis[stage].value += parseFloat(opp.monetaryValue || 0);
    });

    // Identificar deals en riesgo (sin actividad reciente)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const dealsAtRisk = opportunities.filter((opp: any) => {
      const lastUpdate = new Date(opp.lastStatusChangeAt || opp.updatedAt).getTime();
      return opp.status !== 'won' && opp.status !== 'lost' && lastUpdate < thirtyDaysAgo;
    });

    // Calcular tamaño promedio de deal
    const totalValue = opportunities.reduce((sum: number, opp: any) =>
      sum + parseFloat(opp.monetaryValue || 0), 0
    );
    const avgDealSize = opportunities.length > 0 ? totalValue / opportunities.length : 0;

    return {
      pipelineAnalysis,
      dealsAtRisk: dealsAtRisk.length,
      avgDealSize,
      totalPipelineValue: totalValue,
    };
  } catch (error) {
    console.error('❌ Error obteniendo métricas detalladas:', error);
    return null;
  }
}
