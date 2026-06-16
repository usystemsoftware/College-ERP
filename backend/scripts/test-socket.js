const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMWZjZDQzNDVlYWVjZjk3MGRkYzg4NiIsImVtYWlsIjoic3VwZXJhZG1pbkBlcnAuY29tIiwicm9sZSI6IlN1cGVyIEFkbWluIiwiY29sbGVnZUlkIjoiNmExZmNkNDM0NWVhZWNmOTcwZGRjODg0IiwiaWF0IjoxNzgxMzI3MTYyLCJleHAiOjE3ODE5MzE5NjJ9.qAZckVHqz_JR2YoVqlUQQJVwcO7xK0zSRgrbU6BqwkY";

console.log("1. Connecting Admin Socket (Listener)...");
const adminSocket = io("http://localhost:5050", { auth: { token: token } });

console.log("1. Connecting Student Socket (Sender)...");
const studentSocket = io("http://localhost:5050", { auth: { token: token } });

const STUDENT_ID = "student_999";

adminSocket.on("connect", () => {
  console.log("✅ Admin connected! Socket ID:", adminSocket.id);
  adminSocket.emit("join_tracking", STUDENT_ID);
});

adminSocket.on("tracking_started", (data) => {
  console.log("🟢 Admin Joined Room:", data.message);
  
  // Now that admin is listening, student sends location
  console.log("3. Simulating Student App sending location...");
  studentSocket.emit("update_location", {
    studentId: STUDENT_ID,
    lat: 18.5204,
    lng: 73.8567
  });
});

adminSocket.on("location_updated", (data) => {
  console.log(`\n📍 REAL-TIME LOCATION RECEIVED for ${data.studentId}:`);
  console.log(`   Latitude:  ${data.lat}`);
  console.log(`   Longitude: ${data.lng}`);
  console.log(`   Timestamp: ${data.timestamp}`);
  
  console.log("\n✅ Test completed successfully! Both Auth & Routing work perfectly.");
  process.exit(0);
});
