async function testAuth() {
  const baseURL = 'http://localhost:5000/api/v1';
  console.log('Testing authentication flow using native fetch...');

  const hrEmail = process.env.INITIAL_HR_EMAIL || 'hr@gmail.com';
  const hrPassword = process.env.INITIAL_HR_PASSWORD || 'Password123!';

  console.log(`Using email: ${hrEmail} (read from INITIAL_HR_EMAIL)`);

  // 1. Login
  console.log('\n--- 1. POST /auth/login ---');
  const loginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: hrEmail,
      password: hrPassword
    })
  });

  console.log('Login Status:', loginRes.status);
  const loginBody = await loginRes.json() as any;
  console.log('Login Body:', JSON.stringify(loginBody, null, 2));
  const setCookie = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie Header:', setCookie);

  if (!setCookie) {
    console.error('FAIL: No Set-Cookie header found in login response!');
    return;
  }

  const accessToken = loginBody.data.accessToken;

  // 2. GET /auth/me with Access Token
  console.log('\n--- 2. GET /auth/me with Access Token ---');
  const meRes = await fetch(`${baseURL}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log('Get Me Status:', meRes.status);
  const meBody = await meRes.json();
  console.log('Get Me Body:', JSON.stringify(meBody, null, 2));

  // 3. POST /auth/refresh with Cookie
  console.log('\n--- 3. POST /auth/refresh with Cookie ---');
  try {
    const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: setCookie }
    });
    console.log('Refresh Status:', refreshRes.status);
    const refreshBody = await refreshRes.json();
    console.log('Refresh Body:', JSON.stringify(refreshBody, null, 2));
    console.log('New Set-Cookie Header:', refreshRes.headers.get('set-cookie'));
  } catch (err: any) {
    console.error('Refresh failed:', err.message);
  }
}

testAuth().catch(console.error);
