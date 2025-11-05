import { User } from './supabase';
import { callMCPTool } from './ghl-mcp';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

export interface AIResponse {
  response: string;
  queryType: string;
  toolCalls?: any[];
}

export async function processWithAI(query: string, user: User): Promise<AIResponse> {
  console.log('🤖 Processing with AI:', query);
  console.log('🔑 API Key available:', !!ANTHROPIC_API_KEY);

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ No Anthropic API key found');
    return {
      response: 'La API de IA no está configurada. Por favor, configura VITE_ANTHROPIC_API_KEY en el archivo .env',
      queryType: detectQueryType(query),
    };
  }

  try {
    const systemPrompt = `Eres un asistente experto de Selvadentro Tulum, un desarrollo inmobiliario en Tulum, México.

Tu rol es ayudar a ${user.role === 'admin' ? 'administradores' : 'brokers'} a consultar información del CRM GoHighLevel.

Herramientas disponibles del MCP de GoHighLevel (21 tools):

CALENDARIOS:
- calendars_get-calendar-events: Obtiene eventos del calendario
- calendars_get-appointment-notes: Obtiene notas de citas

CONTACTOS:
- contacts_get-all-tasks: Obtiene todas las tareas de un contacto
- contacts_add-tags: Agrega tags a un contacto
- contacts_remove-tags: Remueve tags de un contacto
- contacts_get-contact: Obtiene detalles de un contacto
- contacts_update-contact: Actualiza un contacto
- contacts_upsert-contact: Actualiza o crea un contacto
- contacts_create-contact: Crea un nuevo contacto
- contacts_get-contacts: Obtiene todos los contactos

CONVERSACIONES:
- conversations_search-conversation: Busca/filtra conversaciones
- conversations_get-messages: Obtiene mensajes por ID de conversación
- conversations_send-a-new-message: Envía un mensaje nuevo

UBICACIONES:
- locations_get-location: Obtiene detalles de ubicación
- locations_get-custom-fields: Obtiene campos personalizados

OPORTUNIDADES:
- opportunities_search-opportunity: Busca oportunidades por criterio
- opportunities_get-pipelines: Obtiene todos los pipelines
- opportunities_get-opportunity: Obtiene detalles de una oportunidad
- opportunities_update-opportunity: Actualiza una oportunidad

PAGOS:
- payments_get-order-by-id: Obtiene detalles de orden de pago
- payments_list-transactions: Lista transacciones paginadas

Datos del usuario:
- Nombre: ${user.full_name}
- Rol: ${user.role}
- GHL ID: ${user.ghl_user_id || 'N/A'}
- Location ID: crN2IhAuOBAl7D8324yI

Cuando el usuario pregunte sobre oportunidades, leads, contactos, ventas, etc., usa las herramientas para obtener datos reales del CRM.

Si el usuario es "user" (broker), filtra por assignedTo con su ghl_user_id.
Si es "admin", muestra datos de todo el equipo.

Responde en español de manera clara y profesional. Usa formato markdown cuando sea apropiado.`;

    console.log('📡 Calling Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
        tools: [
          {
            name: 'calendars_get-calendar-events',
            description: 'Obtiene eventos del calendario por userId, groupId o calendarId',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string', description: 'ID de la ubicación' },
                userId: { type: 'string', description: 'ID del usuario' },
                calendarId: { type: 'string', description: 'ID del calendario' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'calendars_get-appointment-notes',
            description: 'Obtiene notas de una cita específica',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                appointmentId: { type: 'string' },
              },
              required: ['locationId', 'appointmentId'],
            },
          },
          {
            name: 'contacts_get-all-tasks',
            description: 'Obtiene todas las tareas de un contacto',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                contactId: { type: 'string' },
              },
              required: ['locationId', 'contactId'],
            },
          },
          {
            name: 'contacts_add-tags',
            description: 'Agrega tags a un contacto',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                contactId: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['locationId', 'contactId', 'tags'],
            },
          },
          {
            name: 'contacts_remove-tags',
            description: 'Remueve tags de un contacto',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                contactId: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['locationId', 'contactId', 'tags'],
            },
          },
          {
            name: 'contacts_get-contact',
            description: 'Obtiene detalles de un contacto',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                contactId: { type: 'string' },
              },
              required: ['locationId', 'contactId'],
            },
          },
          {
            name: 'contacts_update-contact',
            description: 'Actualiza un contacto existente',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                contactId: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
              },
              required: ['locationId', 'contactId'],
            },
          },
          {
            name: 'contacts_upsert-contact',
            description: 'Actualiza o crea un contacto',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
              },
              required: ['locationId', 'email'],
            },
          },
          {
            name: 'contacts_create-contact',
            description: 'Crea un nuevo contacto',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
              },
              required: ['locationId', 'firstName', 'email'],
            },
          },
          {
            name: 'contacts_get-contacts',
            description: 'Obtiene todos los contactos filtrados',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                query: { type: 'string', description: 'Búsqueda de texto' },
                assignedTo: { type: 'string' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'conversations_search-conversation',
            description: 'Busca/filtra/ordena conversaciones',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                contactId: { type: 'string' },
                assignedTo: { type: 'string' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'conversations_get-messages',
            description: 'Obtiene mensajes de una conversación',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                conversationId: { type: 'string' },
              },
              required: ['locationId', 'conversationId'],
            },
          },
          {
            name: 'conversations_send-a-new-message',
            description: 'Envía un mensaje a una conversación',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                conversationId: { type: 'string' },
                message: { type: 'string' },
              },
              required: ['locationId', 'conversationId', 'message'],
            },
          },
          {
            name: 'locations_get-location',
            description: 'Obtiene detalles de una ubicación',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'locations_get-custom-fields',
            description: 'Obtiene campos personalizados de una ubicación',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'opportunities_search-opportunity',
            description: 'Busca oportunidades por criterio',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                status: { type: 'string', description: 'open, won, lost, abandoned' },
                assignedTo: { type: 'string' },
                pipelineId: { type: 'string' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'opportunities_get-pipelines',
            description: 'Obtiene todos los pipelines de oportunidades',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
              },
              required: ['locationId'],
            },
          },
          {
            name: 'opportunities_get-opportunity',
            description: 'Obtiene detalles de una oportunidad específica',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                opportunityId: { type: 'string' },
              },
              required: ['locationId', 'opportunityId'],
            },
          },
          {
            name: 'opportunities_update-opportunity',
            description: 'Actualiza una oportunidad existente',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                opportunityId: { type: 'string' },
                status: { type: 'string' },
                monetaryValue: { type: 'number' },
              },
              required: ['locationId', 'opportunityId'],
            },
          },
          {
            name: 'payments_get-order-by-id',
            description: 'Obtiene detalles de una orden de pago',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                orderId: { type: 'string' },
              },
              required: ['locationId', 'orderId'],
            },
          },
          {
            name: 'payments_list-transactions',
            description: 'Lista transacciones con paginación',
            input_schema: {
              type: 'object',
              properties: {
                locationId: { type: 'string' },
                limit: { type: 'number', description: 'Límite de resultados' },
                offset: { type: 'number', description: 'Offset para paginación' },
              },
              required: ['locationId'],
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('✅ AI Response received:', aiResponse);

    if (aiResponse.content && aiResponse.content.length > 0) {
      const toolUses = aiResponse.content.filter((c: any) => c.type === 'tool_use');

      if (toolUses.length > 0) {
        const toolResults = [];

        for (const toolUse of toolUses) {
          const toolName = toolUse.name;
          const toolInput = toolUse.input;

          if (user.role === 'user' && user.ghl_user_id && !toolInput.assignedTo) {
            toolInput.assignedTo = user.ghl_user_id;
          }

          const mcpResponse = await callMCPTool(toolName, toolInput, user.role, user.ghl_user_id || undefined);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(mcpResponse.data),
          });
        }

        const finalResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: query,
              },
              {
                role: 'assistant',
                content: aiResponse.content,
              },
              {
                role: 'user',
                content: toolResults,
              },
            ],
          }),
        });

        const finalData = await finalResponse.json();
        const textContent = finalData.content.find((c: any) => c.type === 'text');

        return {
          response: textContent?.text || 'No pude procesar la respuesta',
          queryType: detectQueryType(query),
          toolCalls: toolUses,
        };
      }

      const textContent = aiResponse.content.find((c: any) => c.type === 'text');
      return {
        response: textContent?.text || 'No tengo información disponible',
        queryType: detectQueryType(query),
      };
    }

    return {
      response: 'No pude procesar tu consulta. Por favor, intenta de nuevo.',
      queryType: 'general',
    };
  } catch (error) {
    console.error('❌ AI Service Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      response: `Hubo un error al procesar tu consulta: ${errorMessage}`,
      queryType: 'general',
    };
  }
}

function detectQueryType(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('oportunidad') || lowerQuery.includes('pipeline') || lowerQuery.includes('deal')) {
    return 'oportunidades';
  }
  if (lowerQuery.includes('lead') || lowerQuery.includes('contacto') || lowerQuery.includes('prospecto')) {
    return 'leads';
  }
  if (lowerQuery.includes('venta') || lowerQuery.includes('revenue') || lowerQuery.includes('ingreso')) {
    return 'ventas';
  }
  if (lowerQuery.includes('mejor broker') || lowerQuery.includes('ranking')) {
    return 'ranking';
  }
  if (lowerQuery.includes('métrica') || lowerQuery.includes('estadística') || lowerQuery.includes('kpi')) {
    return 'métricas';
  }
  if (lowerQuery.includes('lote') || lowerQuery.includes('propiedad') || lowerQuery.includes('amenidad')) {
    return 'propiedades';
  }

  return 'general';
}
