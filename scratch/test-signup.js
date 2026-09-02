const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testSignup() {
  console.log('Attempting signup via fetch...');
  const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({
      email: 'test_error_' + Date.now() + '@nablus.cl',
      password: 'password123',
      data: {
        nombre: 'Test User',
        posicion_preferida: 'delantero',
        fecha_nacimiento: '1995-01-01',
        es_admin: false,
      },
    }),
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testSignup();
