import { User } from './supabase';
import { getContact, getContacts, getOpportunities, getContactTasks, getConversations, getCalendarEvents } from './ghl-api';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  source?: string;
  assignedTo?: string;
  dateAdded: string;
  lastActivity?: string;
  customFields?: Record<string, any>;
}

export interface ContactActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal_update' | 'message';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

export interface ContactOpportunity {
  id: string;
  name: string;
  status: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate?: string;
  createdAt: string;
  lastUpdate: string;
}

export interface ContactStats {
  totalOpportunities: number;
  totalValue: number;
  wonDeals: number;
  lostDeals: number;
  activeDeals: number;
  averageDealSize: number;
  winRate: number;
  totalInteractions: number;
  lastInteractionDays: number;
  lifetimeValue: number;
}

/**
 * Obtiene detalles completos de un contacto
 */
export async function getContactDetails(
  contactId: string,
  user: User
): Promise<Contact | null> {
  try {
    const response = await getContact(contactId);

    if (!response.success || !response.data?.contact) {
      return null;
    }

    const contact = response.data.contact;

    return {
      id: contact.id,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
      email: contact.email || '',
      phone: contact.phone || '',
      tags: contact.tags || [],
      source: contact.source,
      assignedTo: contact.assignedTo,
      dateAdded: contact.dateAdded || contact.createdAt,
      lastActivity: contact.lastActivity,
      customFields: contact.customFields,
    };
  } catch (error) {
    console.error('Error fetching contact details:', error);
    return null;
  }
}

/**
 * Obtiene todas las oportunidades de un contacto
 */
export async function getContactOpportunities(
  contactId: string,
  user: User
): Promise<ContactOpportunity[]> {
  try {
    // Note: GoHighLevel REST API doesn't have direct contactId filter for opportunities
    // We'll fetch all opportunities for the user and filter by contactId
    const userId = user.ghl_user_id || undefined;
    const isAdmin = user.role === 'admin';

    const response = await getOpportunities(
      isAdmin || !userId ? {} : { assignedTo: userId }
    );

    if (!response.success || !response.data?.opportunities) {
      return [];
    }

    // Filter opportunities by contactId
    const contactOpps = response.data.opportunities.filter(
      (opp: any) => opp.contact?.id === contactId || opp.contactId === contactId
    );

    return contactOpps.map((opp: any) => ({
      id: opp.id,
      name: opp.name || 'Sin título',
      status: opp.status || 'unknown',
      stage: opp.pipelineStage || opp.status,
      value: parseFloat(opp.monetaryValue || 0),
      probability: calculateProbability(opp.pipelineStage || opp.status),
      expectedCloseDate: opp.expectedCloseDate,
      createdAt: opp.createdAt,
      lastUpdate: opp.lastStatusChangeAt || opp.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching contact opportunities:', error);
    return [];
  }
}

/**
 * Obtiene el timeline de actividades de un contacto
 */
export async function getContactTimeline(
  contactId: string,
  user: User
): Promise<ContactActivity[]> {
  const activities: ContactActivity[] = [];

  try {
    // Obtener tareas usando REST API
    const tasksResponse = await getContactTasks(contactId);

    if (tasksResponse.success && tasksResponse.data?.tasks) {
      tasksResponse.data.tasks.forEach((task: any) => {
        activities.push({
          id: task.id,
          type: 'task',
          title: task.title || 'Tarea',
          description: task.description || '',
          timestamp: task.dueDate || task.createdAt,
          metadata: {
            status: task.status,
            completed: task.completed,
          },
        });
      });
    }

    // Obtener conversaciones usando REST API
    const conversationsResponse = await getConversations({ contactId });

    if (conversationsResponse.success && conversationsResponse.data?.conversations) {
      conversationsResponse.data.conversations.forEach((conv: any) => {
        activities.push({
          id: conv.id,
          type: 'message',
          title: 'Conversación',
          description: conv.lastMessage || 'Mensaje enviado',
          timestamp: conv.lastMessageDate || conv.dateUpdated,
          metadata: {
            unreadCount: conv.unreadCount,
          },
        });
      });
    }

    // Obtener citas del calendario usando REST API
    const eventsResponse = await getCalendarEvents({ contactId });

    if (eventsResponse.success && eventsResponse.data?.events) {
      eventsResponse.data.events.forEach((event: any) => {
        activities.push({
          id: event.id,
          type: 'meeting',
          title: event.title || 'Reunión',
          description: event.notes || 'Cita programada',
          timestamp: event.startTime,
          user: event.assignedTo,
          metadata: {
            status: event.status,
            duration: event.duration,
          },
        });
      });
    }

    // Ordenar por fecha (más reciente primero)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return activities;
  } catch (error) {
    console.error('Error fetching contact timeline:', error);
    return activities;
  }
}

/**
 * Calcula estadísticas del contacto
 */
export async function getContactStats(
  contactId: string,
  user: User
): Promise<ContactStats> {
  try {
    const opportunities = await getContactOpportunities(contactId, user);

    const wonDeals = opportunities.filter((o) => o.status === 'won').length;
    const lostDeals = opportunities.filter((o) => o.status === 'lost').length;
    const activeDeals = opportunities.filter(
      (o) => o.status !== 'won' && o.status !== 'lost'
    ).length;

    const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0);
    const lifetimeValue = opportunities
      .filter((o) => o.status === 'won')
      .reduce((sum, o) => sum + o.value, 0);

    const averageDealSize = opportunities.length > 0 ? totalValue / opportunities.length : 0;
    const winRate =
      wonDeals + lostDeals > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;

    // Calcular días desde última interacción
    const timeline = await getContactTimeline(contactId, user);
    const lastInteractionDays = timeline.length > 0
      ? Math.floor(
          (Date.now() - new Date(timeline[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    return {
      totalOpportunities: opportunities.length,
      totalValue,
      wonDeals,
      lostDeals,
      activeDeals,
      averageDealSize,
      winRate,
      totalInteractions: timeline.length,
      lastInteractionDays,
      lifetimeValue,
    };
  } catch (error) {
    console.error('Error calculating contact stats:', error);
    return {
      totalOpportunities: 0,
      totalValue: 0,
      wonDeals: 0,
      lostDeals: 0,
      activeDeals: 0,
      averageDealSize: 0,
      winRate: 0,
      totalInteractions: 0,
      lastInteractionDays: 999,
      lifetimeValue: 0,
    };
  }
}

/**
 * Genera un mapa de calor de actividad (últimos 30 días)
 */
export async function getActivityHeatmap(
  contactId: string,
  user: User
): Promise<{ date: string; count: number }[]> {
  try {
    const timeline = await getContactTimeline(contactId, user);

    // Últimos 30 días
    const days = 30;
    const heatmap: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = timeline.filter((activity) => {
        const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
        return activityDate === dateStr;
      }).length;

      heatmap.push({ date: dateStr, count });
    }

    return heatmap;
  } catch (error) {
    console.error('Error generating activity heatmap:', error);
    return [];
  }
}

/**
 * Calcula el score predictivo de cierre para deals activos
 */
export function calculateDealScore(opportunity: ContactOpportunity, stats: ContactStats): {
  score: number;
  level: 'high' | 'medium' | 'low';
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  // Factor 1: Win rate histórico (30%)
  if (stats.winRate > 50) {
    score += 30;
    factors.push(`Win rate alto (${stats.winRate.toFixed(0)}%)`);
  } else if (stats.winRate > 25) {
    score += 15;
    factors.push(`Win rate medio (${stats.winRate.toFixed(0)}%)`);
  }

  // Factor 2: Actividad reciente (25%)
  if (stats.lastInteractionDays < 7) {
    score += 25;
    factors.push('Actividad reciente (última semana)');
  } else if (stats.lastInteractionDays < 14) {
    score += 15;
    factors.push('Actividad reciente (últimas 2 semanas)');
  } else if (stats.lastInteractionDays < 30) {
    score += 5;
    factors.push('Alguna actividad reciente');
  }

  // Factor 3: Valor del deal (20%)
  if (opportunity.value > stats.averageDealSize * 1.5) {
    score += 20;
    factors.push('Deal de alto valor');
  } else if (opportunity.value > stats.averageDealSize) {
    score += 10;
    factors.push('Deal sobre promedio');
  }

  // Factor 4: Stage del pipeline (15%)
  const stageScore = calculateProbability(opportunity.stage);
  score += stageScore * 0.15;
  if (stageScore > 50) {
    factors.push(`Stage avanzado (${opportunity.stage})`);
  }

  // Factor 5: Tiempo en el pipeline (10%)
  const daysInPipeline = Math.floor(
    (Date.now() - new Date(opportunity.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysInPipeline < 30) {
    score += 10;
    factors.push('Deal reciente (momentum)');
  } else if (daysInPipeline > 90) {
    score -= 10;
    factors.push('Deal antiguo (puede estar estancado)');
  }

  // Normalizar score (0-100)
  score = Math.max(0, Math.min(100, score));

  let level: 'high' | 'medium' | 'low';
  if (score >= 70) level = 'high';
  else if (score >= 40) level = 'medium';
  else level = 'low';

  return { score, level, factors };
}

/**
 * Calcula probabilidad de cierre basada en el stage
 */
function calculateProbability(stage: string): number {
  const stageMap: Record<string, number> = {
    new: 10,
    qualified: 25,
    proposal: 50,
    negotiation: 75,
    'contract sent': 90,
    won: 100,
    lost: 0,
  };

  return stageMap[stage.toLowerCase()] || 25;
}

/**
 * Busca contactos por query
 */
export async function searchContacts(
  query: string,
  user: User
): Promise<Contact[]> {
  try {
    const userId = user.ghl_user_id || undefined;
    const isAdmin = user.role === 'admin';

    const response = await getContacts(
      isAdmin || !userId ? {} : { assignedTo: userId }
    );

    if (!response.success || !response.data?.contacts) {
      return [];
    }

    // Filtrar por query
    const lowerQuery = query.toLowerCase();
    return response.data.contacts
      .filter((contact: any) => {
        const name = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        return name.includes(lowerQuery) || email.includes(lowerQuery);
      })
      .map((contact: any) => ({
        id: contact.id,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
        email: contact.email || '',
        phone: contact.phone || '',
        tags: contact.tags || [],
        source: contact.source,
        assignedTo: contact.assignedTo,
        dateAdded: contact.dateAdded || contact.createdAt,
        lastActivity: contact.lastActivity,
      }))
      .slice(0, 50); // Limitar a 50 resultados
  } catch (error) {
    console.error('Error searching contacts:', error);
    return [];
  }
}
