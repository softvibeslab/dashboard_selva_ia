// Test que las variables de entorno están disponibles
console.log('\n🧪 Verificando variables de entorno...\n');

const envVars = {
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY ? 'SET ✅' : 'NOT SET ❌',
  'VITE_GHL_API_KEY': process.env.VITE_GHL_API_KEY ? 'SET ✅' : 'NOT SET ❌',
  'VITE_GHL_ACCESS_TOKEN': process.env.VITE_GHL_ACCESS_TOKEN ? 'SET ✅' : 'NOT SET ❌',
  'VITE_GHL_LOCATION_ID': process.env.VITE_GHL_LOCATION_ID,
  'VITE_ANTHROPIC_API_KEY': process.env.VITE_ANTHROPIC_API_KEY ? 'SET ✅' : 'NOT SET ❌',
};

console.log('Variables de entorno:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n✅ Nota: Las variables VITE_* solo están disponibles en el cliente (navegador)');
console.log('   Para verificarlas completamente, abre http://localhost:5173 y revisa la consola.\n');
