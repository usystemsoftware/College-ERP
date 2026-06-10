// Removed node-fetch
const API_URL = 'http://localhost:5050/api';

async function testQRFlow() {
  console.log('--- Testing QR Attendance Flow API ---');
  try {
    // 1. Faculty Login
    const fLogin = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sakshi@gmail.com', password: '123456' })
    });
    const fData = await fLogin.json();
    if (!fLogin.ok) throw new Error('Faculty login failed: ' + fData.message);
    const facultyToken = fData.data.accessToken;
    console.log('✅ Faculty logged in');

    // 2. Fetch Subjects
    const subRes = await fetch(`${API_URL}/subjects`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const subData = await subRes.json();
    if (!subRes.ok) throw new Error('Failed to fetch subjects: ' + subData.message);
    const subjects = subData.data;
    if (!subjects || subjects.length === 0) throw new Error('No subjects found in DB');
    const subjectId = subjects[0]._id;
    console.log(`✅ Fetched subjects, using ${subjects[0].name} (${subjectId})`);

    // 3. Generate QR Token
    const qrRes = await fetch(`${API_URL}/attendance/qr/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({ subject: subjectId, date: new Date().toISOString().split('T')[0], lectureType: 'Theory' })
    });
    const qrData = await qrRes.json();
    if (!qrRes.ok) throw new Error('Failed to generate QR: ' + qrData.message);
    const qrToken = qrData.data.token;
    console.log('✅ Faculty generated QR Token: ' + qrToken.substring(0, 20) + '...');

    // 4. Student Login
    const sLogin = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shubham@gmail.com', password: '123456' })
    });
    const sData = await sLogin.json();
    if (!sLogin.ok) throw new Error('Student login failed: ' + sData.message);
    const studentToken = sData.data.accessToken;
    console.log('✅ Student logged in');

    // 5. Verify QR Token
    const vRes = await fetch(`${API_URL}/attendance/qr/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ token: qrToken })
    });
    const vData = await vRes.json();
    if (!vRes.ok) throw new Error('Failed to verify QR: ' + vData.message);
    console.log('✅ Student verified QR. Details:', vData.data);

    // 6. Mark Attendance
    const mRes = await fetch(`${API_URL}/attendance/qr/mark`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ token: qrToken })
    });
    const mData = await mRes.json();
    if (!mRes.ok) {
      if (mData.message.includes('already marked')) {
         console.log('✅ Student already marked attendance (Expected if rerun).');
      } else {
         throw new Error('Failed to mark QR attendance: ' + mData.message);
      }
    } else {
      console.log('✅ Student marked attendance successfully!', mData.data._id);
    }

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
}

testQRFlow();
