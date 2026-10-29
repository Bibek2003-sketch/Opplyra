process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hashPassword,
  verifyPassword,
  register,
  login,
} = require('../src/controllers/authController');
const memoryStore = require('../src/services/memoryStore');

// Helper to create mock response object
function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

test('Password Hashing & Verification', async (t) => {
  await t.test('correctly hashes and verifies passwords', () => {
    const password = 'SecureStudentPassword123!';
    const hashed = hashPassword(password);
    assert.ok(hashed.includes(':'));
    assert.equal(verifyPassword(password, hashed), true);
    assert.equal(verifyPassword('WrongPassword', hashed), false);
  });
});

test('User Registration', async (t) => {
  await t.test('rejects registration with missing full name', async () => {
    const req = {
      body: {
        email: 'student@example.com',
        password: 'Password123',
        fullName: '',
      }
    };
    const res = createMockRes();
    await register(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /full name/);
  });

  await t.test('rejects registration with invalid email', async () => {
    const req = {
      body: {
        email: 'invalid-email',
        password: 'Password123',
        fullName: 'Test Student',
      }
    };
    const res = createMockRes();
    await register(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /valid email/);
  });

  await t.test('rejects registration with short password', async () => {
    const req = {
      body: {
        email: 'student@example.com',
        password: '123',
        fullName: 'Test Student',
      }
    };
    const res = createMockRes();
    await register(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /at least 6 characters/);
  });

  await t.test('registers a new user successfully', async () => {
    const email = `test.${Date.now()}@college.edu`;
    const req = {
      body: {
        email,
        password: 'StrongPassword123',
        fullName: 'Arjun Verma',
        course: 'B.Tech Computer Science',
        academicYear: '3rd Year',
      }
    };
    const res = createMockRes();
    await register(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, email);
    assert.equal(res.body.data.user.fullName, 'Arjun Verma');
  });

  await t.test('rejects registration if email already exists', async () => {
    const email = `duplicate.${Date.now()}@college.edu`;
    const req = {
      body: {
        email,
        password: 'StrongPassword123',
        fullName: 'Duplicate Student',
        course: 'B.Tech IT',
        academicYear: '2nd Year',
      }
    };
    const res1 = createMockRes();
    await register(req, res1);
    assert.equal(res1.statusCode, 201);

    const res2 = createMockRes();
    await register(req, res2);
    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /already exists/);
  });
});

test('User Login', async (t) => {
  const email = `login.test.${Date.now()}@college.edu`;
  const password = 'CorrectPassword123!';

  // First register
  const regReq = {
    body: {
      email,
      password,
      fullName: 'Rohan Sharma',
      course: 'B.Tech Electronics',
      academicYear: '4th Year',
    }
  };
  const regRes = createMockRes();
  await register(regReq, regRes);
  assert.equal(regRes.statusCode, 201);

  await t.test('rejects login with unknown email', async () => {
    const req = { body: { email: 'nonexistent@example.com', password: 'Password123' } };
    const res = createMockRes();
    await login(req, res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /No account found/);
  });

  await t.test('rejects login with incorrect password', async () => {
    const req = { body: { email, password: 'WrongPassword' } };
    const res = createMockRes();
    await login(req, res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /Incorrect password/);
  });

  await t.test('successfully logs in with correct credentials', async () => {
    const req = { body: { email, password } };
    const res = createMockRes();
    await login(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, email);
    assert.equal(res.body.data.user.fullName, 'Rohan Sharma');
  });
});
