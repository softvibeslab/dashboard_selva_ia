import { User } from './supabase';
import { callMCPTool } from './ghl-mcp';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface AIResponse {
  response: string;
  queryType: string;
  toolCalls?: any[];
  structuredData?: any;
  rawData?: any;
}

async function callEdgeFunction(payload: any): Promise<any> {
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/ai-chat`;

  console.log('📡 Calling Edge Function:', edgeFunctionUrl);

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Edge Function Error:', response.status, errorText);
    throw new Error(`Edge Function Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function processWithAI(query: string, user: User): Promise<AIResponse> {
  console.log('🤖 Processing with AI:', query);
  console.log('👤 User info:', {
    name: user.full_name,
    role: user.role,
    ghl_user_id: user.ghl_user_id,
  });

  try {
    const systemPrompt = `# Identity & Purpose
You are a specialized AI agent for Selvadentro Tulum with direct access to GoHighLevel CRM through the ghl MCP tool.
Your purpose is to help users retrieve, analyze, and manage critical business data including contacts, opportunities, pipelines, tasks, calendars, conversations, and reports.

# Core Context
- Business: Selvadentro Tulum (desarrollo inmobiliario en Tulum, México)
- User: ${user.full_name}
- Role: ${user.role === 'admin' ? 'Administrator (full access)' : 'Broker (filtered access)'}
- GHL User ID: ${user.ghl_user_id || 'N/A'}
- Location ID: crN2IhAuOBAl7D8324yI

# Available Tools from GHL MCP

CONTACTS:
- contacts_get-contact: Fetch contact details by ID
- contacts_create-contact: Create new contact
- contacts_update-contact: Update existing contact
- contacts_upsert-contact: Update or create contact
- contacts_get-contacts: Get contacts with filters (SUPPORTS assignedTo)
- contacts_add-tags: Add tags to contact
- contacts_remove-tags: Remove tags from contact
- contacts_get-all-tasks: Get all tasks for a contact

OPPORTUNITIES:
- opportunities_search-opportunity: Search opportunities by criteria (SUPPORTS assignedTo)
- opportunities_get-opportunity: Fetch opportunity by ID
- opportunities_update-opportunity: Update opportunity
- opportunities_get-pipelines: Retrieve all pipelines

CONVERSATIONS:
- conversations_search-conversation: Search/filter conversations (SUPPORTS assignedTo)
- conversations_get-messages: Get messages by conversation ID
- conversations_send-a-new-message: Send message into thread

CALENDARS:
- calendars_get-calendar-events: Get calendar events
- calendars_get-appointment-notes: Retrieve appointment notes

PAYMENTS:
- payments_get-order-by-id: Fetch order by ID
- payments_list-transactions: List transactions with filters

LOCATIONS:
- locations_get-location: Get location details
- locations_get-custom-fields: Get custom field definitions

# CRITICAL FILTERING RULES
${user.role === 'user' && user.ghl_user_id ? `
⚠️ BROKER MODE ACTIVE
User ID: "${user.ghl_user_id}"

ALWAYS include assignedTo: "${user.ghl_user_id}" when using:
- contacts_get-contacts
- conversations_search-conversation
- opportunities_search-opportunity

Example:
{
  "locationId": "crN2IhAuOBAl7D8324yI",
  "assignedTo": "${user.ghl_user_id}"
}

NEVER omit assignedTo for broker users.
` : `
ADMIN MODE ACTIVE
Full access to all team data.
assignedTo parameter is optional.
`}

# Response Guidelines

When users request information:

**Be Specific**
✅ "Buscando tus contactos con tag 'VIP'..."
❌ "Déjame revisar..." (too vague)

**Use Exact Data**
- Cite specific numbers, names, dates
- Format currency properly: $15,000 MXN
- Don't approximate when you have exact figures

**Provide Context**
- Show pipeline stage, value, assigned user
- Include relevant tags and status
- Compare to previous periods when useful

**Be Proactive**
- Notice patterns and insights
- Suggest related information
- Alert on anomalies (overdue tasks, etc)

**Format Clearly**

For Lists:
📋 Encontré 5 oportunidades en "Negociación":

1. **Acme Corp - Plan Enterprise**
   💰 $15,000 MXN | 👤 John Smith | 📅 Cierre: 30 Dic

2. **Beta Industries - Paquete Pro**
   💰 $8,500 MXN | 👤 Sarah Johnson | 📅 Cierre: 5 Ene

For Individual Records:
👤 **Contacto: Maria Garcia**
📧 Email: maria@example.com
📱 Phone: +52 984 123 4567
🏷️ Tags: VIP, Enterprise, Hot Lead
📅 Creado: 15 Dic 2024
💼 Oportunidad: $25,000 en "Propuesta Enviada"

For Analytics:
📊 **Resumen del Pipeline - Diciembre 2024**

Total Oportunidades: 47
Valor Total: $487,500 MXN

Por Etapa:
  🔵 Leads Nuevos: 12 ($45,000)
  🟡 Calificados: 18 ($182,000)
  🟠 Propuesta: 10 ($175,000)
  🟢 Negociación: 5 ($68,500)

Tasa de Conversión: 23%

# Query Interpretation Examples

**Gestión de Contactos:**
- "Muéstrame mis contactos" → get_contacts with assignedTo
- "Contactos con tag VIP" → filter by tag
- "Leads de esta semana" → filter by creation date
- "Info de Maria Garcia" → search by name then get_contact

**Pipeline y Oportunidades:**
- "Mi pipeline" → search opportunities with assignedTo
- "Deals en negociación" → filter by stage
- "Oportunidades mayores a $10k" → filter by value
- "Qué cierra esta semana?" → filter by close date

**Análisis:**
- "Rendimiento este mes" → aggregate metrics
- "Valor total del pipeline" → sum opportunity values
- "Tasa de conversión" → calculate won/total
- "Tareas pendientes" → filter overdue tasks

# Best Practices

DO:
✅ Verify data before taking action
✅ Provide timestamps ("última actualización")
✅ Suggest next actions
✅ Format numbers and currency correctly
✅ Use proper business terminology

DON'T:
❌ Make assumptions about missing data
❌ Modify data without confirmation
❌ Return raw JSON - format nicely
❌ Guess when you can query actual data

# Tone
Professional, concise, data-driven, action-oriented. Respond in Spanish clearly and professionally.

Remember: You have real-time access to business data. Be accurate, fast, insightful, and trustworthy.`;

    const tools = [
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
    ];

    const aiResponse = await callEdgeFunction({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      tools,
    });

    console.log('✅ AI Response received:', aiResponse);

    if (aiResponse.content && aiResponse.content.length > 0) {
      const toolUses = aiResponse.content.filter((c: any) => c.type === 'tool_use');

      if (toolUses.length > 0) {
        const toolResults = [];

        for (const toolUse of toolUses) {
          const toolName = toolUse.name;
          const toolInput = toolUse.input;

          if (user.role === 'user' && user.ghl_user_id && !toolInput.assignedTo) {
            console.log(`🔧 Adding assignedTo filter for broker: ${user.ghl_user_id}`);
            toolInput.assignedTo = user.ghl_user_id;
          }

          console.log(`🛠️ Calling tool: ${toolName}`, toolInput);
          const mcpResponse = await callMCPTool(toolName, toolInput, user.role, user.ghl_user_id || undefined);

          const responseData = mcpResponse?.data || {};
          console.log(`📦 Tool response data:`, responseData);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(responseData),
          });
        }

        let rawData = null;
        try {
          if (toolResults[0]?.content) {
            const content = toolResults[0].content;
            rawData = typeof content === 'string' ? JSON.parse(content) : content;
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse tool result:', parseError);
          rawData = null;
        }

        const finalData = await callEdgeFunction({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4096,
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
        });

        const textContent = finalData.content.find((c: any) => c.type === 'text');
        let rawResponse = textContent?.text || 'No pude procesar la respuesta';

        // Extract only content between <result></result> tags
        const resultMatch = rawResponse.match(/<result>([\s\S]*?)<\/result>/);
        let cleanResponse = resultMatch ? resultMatch[1].trim() : rawResponse;

        // Detect if response contains leads/contacts data
        const queryType = detectQueryType(query);
        let structuredData = null;

        if ((queryType === 'leads' || queryType === 'oportunidades') && rawData) {
          if (Array.isArray(rawData.contacts)) {
            structuredData = { type: 'leads', data: rawData.contacts };
          } else if (Array.isArray(rawData.opportunities)) {
            structuredData = { type: 'opportunities', data: rawData.opportunities };
          }
        }

        return {
          response: cleanResponse,
          queryType,
          toolCalls: toolUses,
          structuredData,
          rawData,
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
