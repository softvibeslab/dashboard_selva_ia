const MCP_ENDPOINT = 'https://services.leadconnectorhq.com/mcp/';
const GHL_TOKEN = import.meta.env.VITE_GHL_ACCESS_TOKEN || '';
const LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || '';
const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY || '';

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
    const filteredInput = { ...input };

    if (userRole === 'user' && userId) {
      filteredInput.assignedTo = userId;
    }

    console.log('🔑 GHL Config:', {
      endpoint: MCP_ENDPOINT,
      hasToken: !!GHL_TOKEN,
      hasApiKey: !!GHL_API_KEY,
      locationId: LOCATION_ID,
      tool,
    });

    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'X-API-Key': GHL_API_KEY,
        'locationId': LOCATION_ID,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: tool,
          arguments: filteredInput,
        },
        id: Date.now(),
      }),
    });

    // Check if response is SSE (text/event-stream) or JSON
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('text/event-stream')) {
      // Handle Server-Sent Events
      const text = await response.text();
      const lines = text.split('\n');
      let jsonData = '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          jsonData = line.substring(6); // Remove 'data: ' prefix
          break;
        }
      }

      if (!jsonData) {
        console.error('❌ MCP Error: No data in SSE response');
        return {
          success: false,
          error: 'No data in SSE response',
        };
      }

      const data = JSON.parse(jsonData);

      if (data.error) {
        console.error('❌ MCP Error:', data.error);
        return {
          success: false,
          error: data.error?.message || 'MCP Error',
        };
      }

      console.log('✅ MCP Success:', tool);
      console.log('📦 SSE MCP Response:', data);
      console.log('📦 SSE MCP Result:', data.result);
      return {
        success: true,
        data: data.result,
      };
    } else {
      // Handle regular JSON
      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('❌ MCP Error:', response.status, data.error || data);
        return {
          success: false,
          error: data.error?.message || `MCP Error: ${response.status}`,
        };
      }

      console.log('✅ MCP Success:', tool);
      console.log('📦 JSON MCP Response:', data);
      console.log('📦 JSON MCP Result:', data.result);
      return {
        success: true,
        data: data.result,
      };
    }
  } catch (error) {
    console.error('❌ MCP Exception:', error);
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
