// Test script para la API REST de GoHighLevel
// Run with: node test-ghl-api.js

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_ACCESS_TOKEN = 'pit-84d7687f-d43f-4434-9804-c671c669dd0f';
const GHL_LOCATION_ID = 'crN2IhAuOBAl7D8324yI';
const GHL_API_VERSION = '2021-07-28';

async function testGHLAPI() {
  console.log('\n🧪 Testing GoHighLevel REST API...\n');

  // Test 1: Get Contacts
  console.log('📞 Test 1: Getting contacts via REST API...');
  try {
    const response = await fetch(
      `${GHL_API_BASE}/contacts/?locationId=${GHL_LOCATION_ID}&limit=5`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
          'Version': GHL_API_VERSION,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('Contacts found:', data.contacts?.length || 0);

      if (data.contacts && data.contacts.length > 0) {
        console.log('\nFirst contact:');
        const contact = data.contacts[0];
        console.log('  - Name:', contact.firstName, contact.lastName);
        console.log('  - Email:', contact.email);
        console.log('  - ID:', contact.id);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Get Opportunities
  console.log('📞 Test 2: Getting opportunities via REST API...');
  try {
    const response = await fetch(
      `${GHL_API_BASE}/opportunities/search?location_id=${GHL_LOCATION_ID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
          'Version': GHL_API_VERSION,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('Opportunities found:', data.opportunities?.length || 0);

      if (data.opportunities && data.opportunities.length > 0) {
        console.log('\nFirst opportunity:');
        const opp = data.opportunities[0];
        console.log('  - Name:', opp.name);
        console.log('  - Value:', opp.monetaryValue);
        console.log('  - Status:', opp.status);
        console.log('  - Stage:', opp.pipelineStage);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('✅ Tests completed!\n');
}

testGHLAPI();
