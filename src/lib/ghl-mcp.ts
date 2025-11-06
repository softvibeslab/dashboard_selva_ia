const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_TOKEN = 'pit-84d7687f-d43f-4434-9804-c671c669dd0f';
const LOCATION_ID = 'crN2IhAuOBAl7D8324yI';

export interface MCPRequest {
  tool: string;
  input: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function callMCPTool(tool: string, input: Record<string, any>, userRole: string, userId?: string): Promise<MCPResponse> {
  try {
    let endpoint = '';
    let method = 'GET';
    const queryParams = new URLSearchParams();

    queryParams.append('locationId', LOCATION_ID);

    if (tool === 'contacts_get-contacts') {
      endpoint = '/contacts/';
      if (input.assignedTo) {
        queryParams.append('assignedTo', input.assignedTo);
      }
    } else if (tool === 'opportunities_search-opportunity') {
      endpoint = '/opportunities/search';
      method = 'POST';
    } else {
      return {
        success: false,
        error: `Unknown tool: ${tool}`,
      };
    }

    const url = `${GHL_BASE_URL}${endpoint}?${queryParams.toString()}`;

    console.log('🔗 Calling GHL API:', { method, url, tool, input });

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST' && tool === 'opportunities_search-opportunity') {
      const body: any = {
        location_id: LOCATION_ID,
      };

      if (input.assignedTo) {
        body.assigned_to = input.assignedTo;
      }

      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error:', response.status, errorText);
      return {
        success: false,
        error: `GHL API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ GHL API Response:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Exception calling GHL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const SELVADENTRO_KNOWLEDGE = {
  name: 'Selvadentro Tulum',
  description: 'Desarrollo residencial eco-friendly en Tulum, México',
  features: [
    'Lotes residenciales integrados con selva primaria',
    '9 cenotes naturales dentro del desarrollo',
    'Áreas de wellness y bienestar',
    'Jungle bars temáticos',
    'Gimnasios equipados',
    'Áreas para mascotas',
    'Canchas deportivas',
    'Seguridad 24/7',
  ],
  location: 'Tulum, Quintana Roo, México',
  priceRange: {
    min: 300000,
    max: 2000000,
    currency: 'MXN'
  },
  investment: {
    averageROI: '18% anual',
    appreciation: '+12% anual',
    rentalYield: '8-12% cap rate'
  }
};
