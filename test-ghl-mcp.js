// Test script for GoHighLevel MCP
// Run with: node test-ghl-mcp.js

const MCP_ENDPOINT = 'https://services.leadconnectorhq.com/mcp/';
const GHL_TOKEN = 'pit-84d7687f-d43f-4434-9804-c671c669dd0f';
const GHL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImNyTjJJaEF1T0JBbDdEODMyNHlJIiwidmVyc2lvbiI6MSwiaWF0IjoxNzQ5OTY5Njg5MjkxLCJzdWIiOiJnRFhtNHJJQjZJbjhxa3Q1dXpKWSJ9.HKfmsDYjb30fxRu6n40R39ED-NEuoWYhJjKvGtxjeUg';
const LOCATION_ID = 'crN2IhAuOBAl7D8324yI';

async function testMCP() {
  console.log('🧪 Testing GoHighLevel MCP...\n');

  // Test 1: Get Contacts
  console.log('📞 Test 1: Getting contacts...');
  try {
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
          name: 'contacts_get-contacts',
          arguments: {
            locationId: LOCATION_ID,
          },
        },
        id: Date.now(),
      }),
    });

    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('text/event-stream')) {
      const text = await response.text();
      console.log('\n📦 Raw SSE Response:\n', text.substring(0, 500), '...\n');

      const lines = text.split('\n');
      let jsonData = '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          jsonData = line.substring(6);
          break;
        }
      }

      if (jsonData) {
        const data = JSON.parse(jsonData);
        console.log('✅ Parsed MCP Response:');
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      const data = await response.json();
      console.log('✅ JSON MCP Response:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMCP();
