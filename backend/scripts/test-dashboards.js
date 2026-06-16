const users = [
    {email:'dhiraj21@gmail.com', password:'123456', role:'student', endpoint: '/students/dashboard'},
    {email:'parent@erp.com', password:'123456', role:'parent', endpoint: '/parents/dashboard'},
    {email:'sakshi@gmail.com', password:'123456', role:'faculty', endpoint: '/faculty/dashboard'},
    {email:'superadmin@erp.com', password:'admin123', role:'superadmin', endpoint: '/analytics/dashboard'}
];

async function testDashboards() {
    for (const u of users) {
        console.log(`\nTesting ${u.role} - ${u.email}`);
        try {
            // Login
            const loginRes = await fetch("http://localhost:5050/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: u.email, password: u.password })
            });
            const loginData = await loginRes.json();
            if (!loginData.success) {
                console.log(`Login failed: ${loginData.message}`);
                continue;
            }
            
            const token = loginData.data.accessToken;
            
            // Dashboard
            const dashRes = await fetch(`http://localhost:5050/api${u.endpoint}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const dashData = await dashRes.json();
            console.log(`Dashboard Status: ${dashRes.status}`);
            if (dashData.success) {
                console.log(`Dashboard Data keys:`, Object.keys(dashData.data));
            } else {
                console.log(`Dashboard Error:`, dashData.message);
            }
        } catch (err) {
            console.error(`Fetch error:`, err.message);
        }
    }
}
testDashboards();
