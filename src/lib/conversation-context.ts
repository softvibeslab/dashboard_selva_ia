import { User } from './supabase';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    queryType?: string;
    toolsUsed?: string[];
    entities?: string[];
  };
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  messages: ConversationMessage[];
  summary?: string;
  entities: {
    contacts: string[];
    deals: string[];
    topics: string[];
  };
  preferences: {
    language: string;
    role: string;
  };
}

// Almacenamiento en memoria de contextos de conversación
const conversationContexts = new Map<string, ConversationContext>();

/**
 * Obtiene o crea un contexto de conversación para un usuario
 */
export function getConversationContext(user: User): ConversationContext {
  const existingContext = conversationContexts.get(user.id);

  if (existingContext) {
    return existingContext;
  }

  // Crear nuevo contexto
  const newContext: ConversationContext = {
    userId: user.id,
    sessionId: generateSessionId(),
    messages: [],
    entities: {
      contacts: [],
      deals: [],
      topics: [],
    },
    preferences: {
      language: 'es',
      role: user.role,
    },
  };

  conversationContexts.set(user.id, newContext);
  return newContext;
}

/**
 * Agrega un mensaje al contexto de conversación
 */
export function addMessageToContext(
  userId: string,
  message: ConversationMessage
): void {
  const context = conversationContexts.get(userId);
  if (!context) return;

  context.messages.push(message);

  // Extraer entidades del mensaje
  extractEntities(message.content, context);

  // Limitar a últimos 20 mensajes para no sobrecargar memoria
  if (context.messages.length > 20) {
    context.messages = context.messages.slice(-20);
  }
}

/**
 * Genera un resumen del contexto actual
 */
export function generateContextSummary(userId: string): string {
  const context = conversationContexts.get(userId);
  if (!context || context.messages.length === 0) {
    return '';
  }

  const recentMessages = context.messages.slice(-5);
  const topics = context.entities.topics.slice(-3);

  let summary = 'Contexto de la conversación:\n';

  if (topics.length > 0) {
    summary += `- Temas discutidos: ${topics.join(', ')}\n`;
  }

  if (context.entities.contacts.length > 0) {
    summary += `- Contactos mencionados: ${context.entities.contacts.slice(0, 3).join(', ')}\n`;
  }

  if (context.entities.deals.length > 0) {
    summary += `- Deals mencionados: ${context.entities.deals.slice(0, 3).join(', ')}\n`;
  }

  summary += `- Mensajes recientes: ${recentMessages.length}`;

  return summary;
}

/**
 * Obtiene el contexto formateado para enviar a la IA
 */
export function getContextForAI(userId: string): string {
  const context = conversationContexts.get(userId);
  if (!context || context.messages.length === 0) {
    return '';
  }

  // Tomar últimos 5 mensajes para contexto
  const recentMessages = context.messages.slice(-5);

  let contextText = '\n\nContexto de la conversación anterior:\n';

  recentMessages.forEach((msg, index) => {
    const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
    const preview = msg.content.substring(0, 150);
    contextText += `${index + 1}. ${role}: ${preview}...\n`;
  });

  return contextText;
}

/**
 * Limpia el contexto de conversación de un usuario
 */
export function clearConversationContext(userId: string): void {
  conversationContexts.delete(userId);
}

/**
 * Extrae entidades del texto (contactos, deals, topics)
 */
function extractEntities(text: string, context: ConversationContext): void {
  const lowerText = text.toLowerCase();

  // Detectar topics comunes
  const topicKeywords = [
    { keywords: ['lead', 'leads', 'contacto', 'contactos'], topic: 'leads' },
    { keywords: ['deal', 'deals', 'oportunidad', 'oportunidades'], topic: 'deals' },
    { keywords: ['pipeline', 'embudo', 'funnel'], topic: 'pipeline' },
    { keywords: ['venta', 'ventas', 'cierre', 'cerrar'], topic: 'ventas' },
    { keywords: ['revenue', 'ingresos', 'dinero'], topic: 'revenue' },
    { keywords: ['tarea', 'tareas', 'pendiente'], topic: 'tareas' },
    { keywords: ['calendario', 'cita', 'meeting'], topic: 'calendario' },
    { keywords: ['riesgo', 'atrasado', 'estancado'], topic: 'riesgo' },
  ];

  topicKeywords.forEach(({ keywords, topic }) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      if (!context.entities.topics.includes(topic)) {
        context.entities.topics.push(topic);
      }
    }
  });

  // Detectar nombres propios (posibles contactos o deals)
  const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
  const names = text.match(namePattern);
  if (names) {
    names.forEach((name) => {
      if (!context.entities.contacts.includes(name)) {
        context.entities.contacts.push(name);
      }
    });
  }
}

/**
 * Genera sugerencias de preguntas basadas en el contexto
 */
export function generateSuggestedQuestions(user: User): string[] {
  const context = getConversationContext(user);
  const suggestions: string[] = [];

  // Sugerencias basadas en rol
  if (user.role === 'admin') {
    suggestions.push(
      'Dashboard del equipo de ventas',
      'Top performers del mes',
      'Deals en riesgo del equipo',
      'Revenue total vs objetivo'
    );
  } else {
    suggestions.push(
      'Mi pipeline personal',
      'Qué tareas tengo hoy',
      'Mis deals en negociación',
      'Mi progreso este mes'
    );
  }

  // Sugerencias basadas en topics recientes
  if (context.entities.topics.includes('riesgo')) {
    suggestions.push('Cómo puedo reactivar estos deals?');
  }

  if (context.entities.topics.includes('leads')) {
    suggestions.push('Leads nuevos de esta semana');
  }

  if (context.entities.topics.includes('pipeline')) {
    suggestions.push('Análisis detallado del pipeline');
  }

  // Sugerencias basadas en contactos mencionados
  if (context.entities.contacts.length > 0) {
    const lastContact = context.entities.contacts[context.entities.contacts.length - 1];
    suggestions.push(`Historial completo de ${lastContact}`);
  }

  // Limitar a 6 sugerencias únicas
  return [...new Set(suggestions)].slice(0, 6);
}

/**
 * Analiza el mensaje para determinar si requiere acciones rápidas
 */
export function analyzeMessageForQuickActions(
  message: string
): { type: string; label: string; action: string }[] {
  const lowerMessage = message.toLowerCase();
  const actions: { type: string; label: string; action: string }[] = [];

  // Si menciona deals o oportunidades
  if (lowerMessage.includes('deal') || lowerMessage.includes('oportunidad')) {
    actions.push({
      type: 'navigate',
      label: 'Ver Pipeline',
      action: 'pipeline',
    });
  }

  // Si menciona contactos o leads
  if (lowerMessage.includes('contacto') || lowerMessage.includes('lead')) {
    actions.push({
      type: 'query',
      label: 'Ver detalles',
      action: 'get_contact_details',
    });
  }

  // Si menciona tareas
  if (lowerMessage.includes('tarea') || lowerMessage.includes('pendiente')) {
    actions.push({
      type: 'query',
      label: 'Ver todas las tareas',
      action: 'list_all_tasks',
    });
  }

  // Si menciona calendario o citas
  if (lowerMessage.includes('calendario') || lowerMessage.includes('cita')) {
    actions.push({
      type: 'query',
      label: 'Ver calendario',
      action: 'show_calendar',
    });
  }

  // Si menciona riesgo
  if (lowerMessage.includes('riesgo') || lowerMessage.includes('atrasado')) {
    actions.push({
      type: 'navigate',
      label: 'Ver Dashboard',
      action: 'executive',
    });
  }

  return actions;
}

/**
 * Genera un ID único para la sesión
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Obtiene estadísticas del contexto actual
 */
export function getContextStats(userId: string): {
  messageCount: number;
  topicsCount: number;
  contactsCount: number;
  dealsCount: number;
} {
  const context = conversationContexts.get(userId);

  if (!context) {
    return {
      messageCount: 0,
      topicsCount: 0,
      contactsCount: 0,
      dealsCount: 0,
    };
  }

  return {
    messageCount: context.messages.length,
    topicsCount: context.entities.topics.length,
    contactsCount: context.entities.contacts.length,
    dealsCount: context.entities.deals.length,
  };
}
