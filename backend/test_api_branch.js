async function run() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sweetflow.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) return;

    const token = loginData.data.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('\nFetching stats for mock_420h5vw7y...');
    const statsRes = await fetch('http://localhost:5000/api/analytics/stats?branchId=mock_420h5vw7y', { headers });
    const statsData = await statsRes.json();
    console.log('Stats Response:', JSON.stringify(statsData, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
