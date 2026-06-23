const API_URL = 'http://localhost:5050/api';

const users = [
  { email: 'superadmin@erp.com', password: 'admin123', role: 'Super Admin' },
  { email: 'sakshi@gmail.com', password: '123456', role: 'Faculty' },
  { email: 'shubham@gmail.com', password: '123456', role: 'Student' }
];

async function testFlow() {
  for (const user of users) {
    console.log(`\n--- Testing ${user.role} (${user.email}) ---`);
    try {
      // Login
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
      
      const token = loginData.data.accessToken;
      console.log('Login successful. Token acquired.');

      // Check Profile
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      console.log(`Profile Name: ${profileData.data?.name || profileData.data?.fullName || 'Unknown'}`);

      // Check Attendance Dashboard
      const attendanceRes = await fetch(`${API_URL}/attendance/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Attendance Dashboard Status: ${attendanceRes.status}`);

      // Check Student Self-Attendance Today if Student
      if (user.role === 'Student') {
        const todayRes = await fetch(`${API_URL}/attendance/student-today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Student Today Attendance Status: ${todayRes.status}`);
      }

    } catch (err) {
      console.error(`Error during testing ${user.role}:`, err.message);
    }
  }
}

testFlow();
