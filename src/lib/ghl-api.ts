/**
 * GoHighLevel REST API Client
 * Alternativa directa y estable al MCP
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const GHL_ACCESS_TOKEN = import.meta.env.VITE_GHL_ACCESS_TOKEN || '';
const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || '';

interface GHLApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Configuración base para todas las llamadas a la API
 */
const getHeaders = () => ({
  'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
  'Version': GHL_API_VERSION,
  'Content-Type': 'application/json',
});

/**
 * Obtener todos los contactos
 */
export async function getContacts(params?: {
  assignedTo?: string;
  limit?: number;
  skip?: number;
}): Promise<GHLApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      locationId: GHL_LOCATION_ID,
      ...(params?.assignedTo && { assignedTo: params.assignedTo }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.skip && { skip: params.skip.toString() }),
    });

    console.log('📞 GHL API: Fetching contacts...', { locationId: GHL_LOCATION_ID });

    const response = await fetch(
      `${GHL_API_BASE}/contacts/?${queryParams}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Contacts fetched successfully', {
      count: data.contacts?.length || 0,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtener un contacto específico
 */
export async function getContact(contactId: string): Promise<GHLApiResponse> {
  try {
    console.log('📞 GHL API: Fetching contact...', { contactId });

    const response = await fetch(
      `${GHL_API_BASE}/contacts/${contactId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Contact fetched successfully');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtener todas las oportunidades
 */
export async function getOpportunities(params?: {
  assignedTo?: string;
  pipelineId?: string;
  status?: string;
}): Promise<GHLApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      location_id: GHL_LOCATION_ID,
      ...(params?.assignedTo && { assignedTo: params.assignedTo }),
      ...(params?.pipelineId && { pipelineId: params.pipelineId }),
      ...(params?.status && { status: params.status }),
    });

    console.log('📞 GHL API: Fetching opportunities...', { locationId: GHL_LOCATION_ID });

    const response = await fetch(
      `${GHL_API_BASE}/opportunities/search?${queryParams}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Opportunities fetched successfully', {
      count: data.opportunities?.length || 0,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtener pipelines
 */
export async function getPipelines(): Promise<GHLApiResponse> {
  try {
    console.log('📞 GHL API: Fetching pipelines...');

    const response = await fetch(
      `${GHL_API_BASE}/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Pipelines fetched successfully');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtener tareas de un contacto
 */
export async function getContactTasks(contactId: string): Promise<GHLApiResponse> {
  try {
    console.log('📞 GHL API: Fetching contact tasks...', { contactId });

    const response = await fetch(
      `${GHL_API_BASE}/contacts/${contactId}/tasks`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Contact tasks fetched successfully');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtener conversaciones
 */
export async function getConversations(params?: {
  contactId?: string;
  assignedTo?: string;
}): Promise<GHLApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      locationId: GHL_LOCATION_ID,
      ...(params?.contactId && { contactId: params.contactId }),
      ...(params?.assignedTo && { assignedTo: params.assignedTo }),
    });

    console.log('📞 GHL API: Fetching conversations...');

    const response = await fetch(
      `${GHL_API_BASE}/conversations/search?${queryParams}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Conversations fetched successfully');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtener eventos de calendario
 */
export async function getCalendarEvents(params?: {
  contactId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<GHLApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      locationId: GHL_LOCATION_ID,
      ...(params?.contactId && { contactId: params.contactId }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });

    console.log('📞 GHL API: Fetching calendar events...');

    const response = await fetch(
      `${GHL_API_BASE}/calendars/events?${queryParams}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API: Calendar events fetched successfully');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ GHL API Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test de conectividad con la API
 */
export async function testGHLConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing GHL API connection...');

    const response = await getContacts({ limit: 1 });

    if (response.success) {
      console.log('✅ GHL API connection successful!');
      return true;
    } else {
      console.error('❌ GHL API connection failed:', response.error);
      return false;
    }
  } catch (error) {
    console.error('❌ GHL API connection test error:', error);
    return false;
  }
}
