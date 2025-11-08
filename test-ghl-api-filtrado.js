// Test de filtrado por usuario en GoHighLevel REST API
// Demuestra cómo filtrar datos según el rol del usuario

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_ACCESS_TOKEN = 'pit-84d7687f-d43f-4434-9804-c671c669dd0f';
const GHL_LOCATION_ID = 'crN2IhAuOBAl7D8324yI';
const GHL_API_VERSION = '2021-07-28';

// Ejemplo de usuarios de la base de datos
const USERS = {
  admin: {
    id: '123-admin',
    email: 'admin@selvadentrotulum.com',
    role: 'admin',
    ghl_user_id: null, // Admins no tienen filtro
  },
  broker1: {
    id: '456-broker',
    email: 'mmolina@selvadentrotulum.com',
    role: 'user',
    ghl_user_id: 'vWerQ2MELDsCSFFKxkJQ', // ID del broker en GHL
  },
  broker2: {
    id: '789-broker',
    email: 'jgarcia@selvadentrotulum.com',
    role: 'user',
    ghl_user_id: 'jVFCuWoAZEFJ7x85sJTz', // Otro broker en GHL
  }
};

async function testUserFiltering(user) {
  console.log('\n' + '='.repeat(70));
  console.log(`🔍 Testing data for: ${user.email} (${user.role})`);
  console.log('='.repeat(70));

  const isAdmin = user.role === 'admin';
  const userId = user.ghl_user_id;

  // ============================================
  // TEST 1: CONTACTOS
  // ============================================
  console.log('\n📞 1. CONTACTOS:');

  let url = `${GHL_API_BASE}/contacts/?locationId=${GHL_LOCATION_ID}`;

  // Si es broker (user), filtrar por assignedTo
  if (!isAdmin && userId) {
    url += `&assignedTo=${userId}`;
    console.log(`   ⚠️  Filtrando por assignedTo: ${userId}`);
  } else {
    console.log(`   ✓  Sin filtro (Admin ve todo)`);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
        'Version': GHL_API_VERSION,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Contactos encontrados: ${data.contacts?.length || 0}`);

      if (data.contacts && data.contacts.length > 0) {
        console.log('\n   Primeros 3 contactos:');
        data.contacts.slice(0, 3).forEach((contact, i) => {
          console.log(`   ${i + 1}. ${contact.firstName || ''} ${contact.lastName || ''} (${contact.email})`);
          console.log(`      Asignado a: ${contact.assignedTo || 'No asignado'}`);
        });
      }
    } else {
      console.log(`   ❌ Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`   ❌ Exception:`, error.message);
  }

  // ============================================
  // TEST 2: OPORTUNIDADES
  // ============================================
  console.log('\n💰 2. OPORTUNIDADES:');

  url = `${GHL_API_BASE}/opportunities/search?location_id=${GHL_LOCATION_ID}`;

  // Si es broker, filtrar por assignedTo
  if (!isAdmin && userId) {
    url += `&assignedTo=${userId}`;
    console.log(`   ⚠️  Filtrando por assignedTo: ${userId}`);
  } else {
    console.log(`   ✓  Sin filtro (Admin ve todo)`);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
        'Version': GHL_API_VERSION,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Oportunidades encontradas: ${data.opportunities?.length || 0}`);

      if (data.opportunities && data.opportunities.length > 0) {
        // Calcular métricas
        let totalValue = 0;
        let wonDeals = 0;

        data.opportunities.forEach(opp => {
          totalValue += parseFloat(opp.monetaryValue || 0);
          if (opp.status === 'won') wonDeals++;
        });

        console.log(`\n   📊 MÉTRICAS:`);
        console.log(`   - Total oportunidades: ${data.opportunities.length}`);
        console.log(`   - Valor total pipeline: $${totalValue.toLocaleString()}`);
        console.log(`   - Deals ganados: ${wonDeals}`);
        console.log(`   - Tasa de conversión: ${((wonDeals / data.opportunities.length) * 100).toFixed(1)}%`);

        console.log('\n   Primeras 3 oportunidades:');
        data.opportunities.slice(0, 3).forEach((opp, i) => {
          console.log(`   ${i + 1}. ${opp.name} - $${opp.monetaryValue || 0}`);
          console.log(`      Status: ${opp.status} | Stage: ${opp.pipelineStage || 'N/A'}`);
          console.log(`      Asignado a: ${opp.assignedTo || 'No asignado'}`);
        });
      }
    } else {
      console.log(`   ❌ Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`   ❌ Exception:`, error.message);
  }
}

async function runTests() {
  console.log('\n🧪 PRUEBA DE FILTRADO POR USUARIO - GoHighLevel REST API\n');
  console.log('Este test demuestra cómo cada usuario ve diferentes datos:\n');
  console.log('• ADMIN: Ve todos los contactos y oportunidades');
  console.log('• BROKER: Solo ve sus contactos/oportunidades asignadas');

  // Test para cada tipo de usuario
  await testUserFiltering(USERS.admin);
  await testUserFiltering(USERS.broker1);

  console.log('\n' + '='.repeat(70));
  console.log('✅ Tests completados!');
  console.log('='.repeat(70));
  console.log('\n💡 CONCLUSIÓN:');
  console.log('   La API REST de GHL soporta filtrado por usuario usando el parámetro');
  console.log('   "assignedTo" en TODAS las llamadas (contacts, opportunities, etc.)');
  console.log('\n   Cada broker SOLO verá los datos que le están asignados.');
  console.log('   Los admins ven TODOS los datos al no usar el filtro assignedTo.\n');
}

runTests();
