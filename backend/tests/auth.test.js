const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Role = require('../src/modules/roles/role.model');
const College = require('../src/modules/colleges/college.model');

describe('Auth API Endpoints', () => {
  let collegeId;
  let roleId;

  beforeEach(async () => {
    // Setup required DB documents for Auth tests
    const college = await College.create({
      name: 'Test College',
      code: 'TEST01',
      address: 'Test Addr',
      email: 'contact@test.edu',
      phone: '1234567890'
    });
    collegeId = college._id;

    const role = await Role.create({
      name: 'Student', // Changed from Super Admin to Student to allow public registration
      description: 'Student Role',
      permissions: ['read']
    });
    roleId = role._id;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const payload = {
        email: 'student@test.edu',
        password: 'Password123!',
        roleName: 'Student',
        collegeCode: 'TEST01'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      
      const user = await User.findOne({ email: 'student@test.edu' });
      expect(user).toBeTruthy();
      expect(user.collegeId.toString()).toBe(collegeId.toString());
      expect(user.role.toString()).toBe(roleId.toString());
    });

    it('should fail if email already exists', async () => {
      await User.create({
        email: 'student@test.edu',
        password: 'hashedpassword',
        role: roleId,
        collegeId: collegeId,
        status: 'Active'
      });

      const payload = {
        email: 'student@test.edu',
        password: 'Password123!',
        roleName: 'Student',
        collegeCode: 'TEST01'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'student@test.edu',
          password: 'Password123!',
          roleName: 'Student',
          collegeCode: 'TEST01'
        });
        
        // Ensure user is Active and not Pending so login works
        await User.updateOne({ email: 'student@test.edu' }, { status: 'Active' });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.edu',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      
      // Check if refresh token cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/refreshToken=/);
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.edu',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
