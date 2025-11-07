import { User } from './supabase';
import { callMCPTool } from './ghl-mcp';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  lastRun?: string;
  executionCount: number;
}

export type AutomationTrigger =
  | 'new_lead'
  | 'lead_responded'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'deal_stale'
  | 'no_activity';

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface AutomationAction {
  type: 'assign' | 'tag' | 'notify' | 'create_task' | 'send_message';
  parameters: Record<string, any>;
}

export interface HotLead {
  contactId: string;
  name: string;
  email: string;
  score: number;
  level: 'hot' | 'warm' | 'cold';
  reasons: string[];
  suggestedAction: string;
}

export interface FollowUpSuggestion {
  contactId: string;
  dealId?: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: string;
  daysSinceLastContact: number;
  dealValue?: number;
}

// ============================================
// HOT LEAD DETECTION
// ============================================

/**
 * Detecta leads "hot" basándose en actividad y engagement
 */
export async function detectHotLeads(user: User): Promise<HotLead[]> {
  try {
    const isAdmin = user.role === 'admin';
    const userId = user.ghl_user_id;

    // Obtener contactos
    const contactsResponse = await callMCPTool(
      'contacts_get-contacts',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        ...(isAdmin ? {} : { assignedTo: userId }),
      },
      user.role,
      userId
    );

    if (!contactsResponse.success || !contactsResponse.data?.contacts) {
      return [];
    }

    const contacts = contactsResponse.data.contacts;
    const hotLeads: HotLead[] = [];

    // Analizar cada contacto
    for (const contact of contacts.slice(0, 50)) {
      // Limitar a 50 para performance
      const score = await calculateLeadScore(contact, user);

      if (score.score >= 60) {
        // Hot threshold
        hotLeads.push({
          contactId: contact.id,
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
          email: contact.email || '',
          score: score.score,
          level: score.level,
          reasons: score.reasons,
          suggestedAction: score.suggestedAction,
        });
      }
    }

    // Ordenar por score (mayor primero)
    hotLeads.sort((a, b) => b.score - a.score);

    return hotLeads;
  } catch (error) {
    console.error('Error detecting hot leads:', error);
    return [];
  }
}

/**
 * Calcula el score de un lead
 */
async function calculateLeadScore(
  contact: any,
  user: User
): Promise<{
  score: number;
  level: 'hot' | 'warm' | 'cold';
  reasons: string[];
  suggestedAction: string;
}> {
  let score = 0;
  const reasons: string[] = [];

  // Factor 1: Tags (30 puntos)
  const hotTags = ['hot', 'interested', 'qualified', 'demo', 'proposal'];
  const warmTags = ['warm', 'contacted', 'follow-up'];

  if (contact.tags) {
    const contactTags = contact.tags.map((t: string) => t.toLowerCase());

    if (contactTags.some((t: string) => hotTags.includes(t))) {
      score += 30;
      reasons.push('Tag de alto interés');
    } else if (contactTags.some((t: string) => warmTags.includes(t))) {
      score += 15;
      reasons.push('Tag de interés medio');
    }
  }

  // Factor 2: Actividad reciente (25 puntos)
  if (contact.lastActivity) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(contact.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity < 3) {
      score += 25;
      reasons.push('Actividad muy reciente (últimos 3 días)');
    } else if (daysSinceActivity < 7) {
      score += 15;
      reasons.push('Actividad reciente (última semana)');
    }
  }

  // Factor 3: Tiene oportunidades activas (20 puntos)
  try {
    const oppsResponse = await callMCPTool(
      'opportunities_search-opportunity',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        contactId: contact.id,
      },
      user.role,
      user.ghl_user_id
    );

    if (oppsResponse.success && oppsResponse.data?.opportunities) {
      const activeOpps = oppsResponse.data.opportunities.filter(
        (opp: any) => opp.status !== 'won' && opp.status !== 'lost'
      );

      if (activeOpps.length > 0) {
        score += 20;
        reasons.push(`${activeOpps.length} oportunidad${activeOpps.length > 1 ? 'es' : ''} activa${activeOpps.length > 1 ? 's' : ''}`);

        // Bonus si el deal está en stage avanzado
        const advancedStages = ['proposal', 'negotiation', 'contract sent'];
        if (activeOpps.some((opp: any) => advancedStages.includes(opp.pipelineStage?.toLowerCase()))) {
          score += 10;
          reasons.push('Deal en stage avanzado');
        }
      }
    }
  } catch (error) {
    // Silently fail
  }

  // Factor 4: Email/phone disponible (15 puntos)
  if (contact.email) {
    score += 10;
  }
  if (contact.phone) {
    score += 5;
    reasons.push('Información de contacto completa');
  }

  // Factor 5: Source de calidad (10 puntos)
  const qualitySources = ['referral', 'website', 'inbound'];
  if (contact.source && qualitySources.includes(contact.source.toLowerCase())) {
    score += 10;
    reasons.push(`Fuente de calidad: ${contact.source}`);
  }

  // Determinar nivel
  let level: 'hot' | 'warm' | 'cold';
  if (score >= 70) level = 'hot';
  else if (score >= 40) level = 'warm';
  else level = 'cold';

  // Sugerir acción
  let suggestedAction = '';
  if (score >= 70) {
    suggestedAction = 'Contactar inmediatamente - Alta prioridad';
  } else if (score >= 40) {
    suggestedAction = 'Programar seguimiento esta semana';
  } else {
    suggestedAction = 'Mantener en nurturing';
  }

  return { score, level, reasons, suggestedAction };
}

// ============================================
// FOLLOW-UP SUGGESTIONS
// ============================================

/**
 * Genera sugerencias de follow-up basadas en actividad
 */
export async function generateFollowUpSuggestions(user: User): Promise<FollowUpSuggestion[]> {
  try {
    const isAdmin = user.role === 'admin';
    const userId = user.ghl_user_id;

    // Obtener oportunidades
    const oppsResponse = await callMCPTool(
      'opportunities_search-opportunity',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        ...(isAdmin ? {} : { assignedTo: userId }),
      },
      user.role,
      userId
    );

    if (!oppsResponse.success || !oppsResponse.data?.opportunities) {
      return [];
    }

    const opportunities = oppsResponse.data.opportunities;
    const suggestions: FollowUpSuggestion[] = [];

    // Analizar cada oportunidad
    opportunities.forEach((opp: any) => {
      if (opp.status === 'won' || opp.status === 'lost') {
        return; // Skip closed deals
      }

      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(opp.lastStatusChangeAt || opp.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let priority: 'high' | 'medium' | 'low' = 'low';
      let reason = '';
      let suggestedAction = '';

      // Lógica de priorización
      if (daysSinceUpdate > 14) {
        priority = 'high';
        reason = `${daysSinceUpdate} días sin actualizar`;
        suggestedAction = 'Llamada de reactivación urgente';
      } else if (daysSinceUpdate > 7) {
        priority = 'medium';
        reason = `${daysSinceUpdate} días sin actualizar`;
        suggestedAction = 'Email de check-in';
      } else if (opp.pipelineStage?.toLowerCase() === 'negotiation') {
        priority = 'high';
        reason = 'En negociación - cerrar pronto';
        suggestedAction = 'Push para cierre esta semana';
      } else if (opp.pipelineStage?.toLowerCase() === 'proposal') {
        priority = 'medium';
        reason = 'Propuesta enviada';
        suggestedAction = 'Follow-up sobre propuesta';
      }

      if (priority !== 'low' || daysSinceUpdate > 3) {
        suggestions.push({
          contactId: opp.contactId || opp.contact?.id,
          dealId: opp.id,
          name: opp.name || opp.contact?.name || 'Sin nombre',
          priority,
          reason,
          suggestedAction,
          daysSinceLastContact: daysSinceUpdate,
          dealValue: parseFloat(opp.monetaryValue || 0),
        });
      }
    });

    // Ordenar por prioridad y valor
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return (b.dealValue || 0) - (a.dealValue || 0);
    });

    return suggestions.slice(0, 20); // Top 20
  } catch (error) {
    console.error('Error generating follow-up suggestions:', error);
    return [];
  }
}

// ============================================
// AUTO-ASSIGNMENT
// ============================================

export interface AssignmentRule {
  id: string;
  name: string;
  enabled: boolean;
  criteria: {
    tags?: string[];
    source?: string[];
    valueMin?: number;
    valueMax?: number;
  };
  assignTo: string; // User ID
  assignToName: string;
}

/**
 * Sugiere asignación automática de leads basada en reglas
 */
export async function suggestAutoAssignment(
  contactId: string,
  rules: AssignmentRule[],
  user: User
): Promise<AssignmentRule | null> {
  try {
    // Obtener detalles del contacto
    const contactResponse = await callMCPTool(
      'contacts_get-contact',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        contactId: contactId,
      },
      user.role,
      user.ghl_user_id
    );

    if (!contactResponse.success || !contactResponse.data?.contact) {
      return null;
    }

    const contact = contactResponse.data.contact;

    // Evaluar cada regla
    for (const rule of rules.filter((r) => r.enabled)) {
      let matches = true;

      // Verificar tags
      if (rule.criteria.tags && rule.criteria.tags.length > 0) {
        const contactTags = (contact.tags || []).map((t: string) => t.toLowerCase());
        const hasMatchingTag = rule.criteria.tags.some((tag) =>
          contactTags.includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) matches = false;
      }

      // Verificar source
      if (rule.criteria.source && rule.criteria.source.length > 0) {
        if (!contact.source || !rule.criteria.source.includes(contact.source)) {
          matches = false;
        }
      }

      // Si todas las condiciones coinciden, retornar esta regla
      if (matches) {
        return rule;
      }
    }

    return null; // No matching rule
  } catch (error) {
    console.error('Error suggesting auto-assignment:', error);
    return null;
  }
}

/**
 * Ejecuta la asignación automática
 */
export async function executeAutoAssignment(
  contactId: string,
  userId: string,
  user: User
): Promise<boolean> {
  try {
    const response = await callMCPTool(
      'contacts_update-contact',
      {
        locationId: 'crN2IhAuOBAl7D8324yI',
        contactId: contactId,
        assignedTo: userId,
      },
      user.role,
      user.ghl_user_id
    );

    return response.success;
  } catch (error) {
    console.error('Error executing auto-assignment:', error);
    return false;
  }
}

// ============================================
// AUTOMATION RULES EXECUTION
// ============================================

/**
 * Evalúa y ejecuta reglas de automatización
 */
export async function evaluateAutomationRules(
  rules: AutomationRule[],
  user: User
): Promise<{ executed: number; failed: number }> {
  let executed = 0;
  let failed = 0;

  for (const rule of rules.filter((r) => r.enabled)) {
    try {
      const shouldExecute = await evaluateRule(rule, user);

      if (shouldExecute) {
        await executeRule(rule, user);
        executed++;
      }
    } catch (error) {
      console.error(`Error executing rule ${rule.id}:`, error);
      failed++;
    }
  }

  return { executed, failed };
}

async function evaluateRule(rule: AutomationRule, user: User): Promise<boolean> {
  // Simplified evaluation - in production this would be more complex
  // For now, return true for demonstration
  return true;
}

async function executeRule(rule: AutomationRule, user: User): Promise<void> {
  // Execute each action in the rule
  for (const action of rule.actions) {
    switch (action.type) {
      case 'assign':
        // Implementation would call update contact with assignedTo
        break;
      case 'tag':
        // Implementation would call add-tags
        break;
      case 'notify':
        // Implementation would send notification
        break;
      case 'create_task':
        // Implementation would create task
        break;
      case 'send_message':
        // Implementation would send message
        break;
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene reglas de automatización guardadas (mock for now)
 */
export function getSavedAutomationRules(): AutomationRule[] {
  // In production, this would fetch from database
  return [
    {
      id: '1',
      name: 'Auto-asignar leads VIP',
      enabled: true,
      trigger: 'new_lead',
      conditions: [
        { field: 'tags', operator: 'contains', value: 'VIP' },
      ],
      actions: [
        { type: 'assign', parameters: { userId: 'senior-rep' } },
        { type: 'notify', parameters: { message: 'Nuevo lead VIP asignado' } },
      ],
      createdAt: new Date().toISOString(),
      executionCount: 0,
    },
  ];
}

/**
 * Obtiene reglas de asignación guardadas (mock for now)
 */
export function getSavedAssignmentRules(): AssignmentRule[] {
  // In production, this would fetch from database
  return [
    {
      id: '1',
      name: 'VIP leads → Senior Rep',
      enabled: true,
      criteria: { tags: ['VIP', 'Enterprise'] },
      assignTo: 'senior-rep-id',
      assignToName: 'Sarah Johnson',
    },
    {
      id: '2',
      name: 'Web leads → Junior Reps',
      enabled: true,
      criteria: { source: ['website', 'landing-page'] },
      assignTo: 'junior-rep-id',
      assignToName: 'Mike Chen',
    },
  ];
}
