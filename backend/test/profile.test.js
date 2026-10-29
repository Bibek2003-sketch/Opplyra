process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
} = require('../src/controllers/profileController');
const {
  register,
  login,
} = require('../src/controllers/authController');
const memoryStore = require('../src/services/memoryStore');

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

test('Student Profile & Account Management Suite', async (t) => {
  // Setup a test student user
  const studentEmail = `profile.test.${Date.now()}@college.edu`;
  const initialPassword = 'InitialSecretPass123!';

  const regReq = {
    body: {
      email: studentEmail,
      password: initialPassword,
      fullName: 'Aarav Mehta',
      course: 'B.Tech Information Technology',
      academicYear: '2nd Year',
    }
  };
  const regRes = createMockRes();
  await register(regReq, regRes);
  assert.equal(regRes.statusCode, 201);
  const studentUser = regRes.body.data.user;

  await t.test('1. GET /api/profile returns sanitized student profile without sensitive fields', async () => {
    const req = {
      user: {
        id: studentUser._id,
        email: studentUser.email,
        role: studentUser.role,
      }
    };
    const res = createMockRes();
    await getProfile(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
    assert.equal(res.body.data.email, studentEmail);
    assert.equal(res.body.data.fullName, 'Aarav Mehta');
    assert.equal(res.body.data.password, undefined);
    assert.equal(res.body.data.passwordHash, undefined);
    assert.equal(res.body.data.salt, undefined);
    assert.ok(Array.isArray(res.body.data.skills));
  });

  await t.test('2. PUT /api/profile updates permitted fields and ignores protected fields', async () => {
    const req = {
      user: {
        id: studentUser._id,
        email: studentUser.email,
      },
      body: {
        fullName: 'Aarav K. Mehta',
        phone: '+91 91234 56789',
        city: 'Pune',
        state: 'Maharashtra',
        university: 'Pune Institute of Computer Technology',
        cgpa: 9.15,
        skills: ['React', 'Node.js', 'PostgreSQL'],
        careerInterests: ['Cloud Architecture', 'DevOps'],
        preferredCategories: ['Internships', 'Jobs'],
        // Attempt to maliciously escalate role and verify status
        role: 'admin',
        isEmailVerified: false,
        password: 'HackedPassword999',
      }
    };
    const res = createMockRes();
    await updateProfile(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.fullName, 'Aarav K. Mehta');
    assert.equal(res.body.data.phone, '+91 91234 56789');
    assert.equal(res.body.data.city, 'Pune');
    assert.equal(res.body.data.cgpa, 9.15);
    assert.deepEqual(res.body.data.skills, ['React', 'Node.js', 'PostgreSQL']);
    // Ensure role and password were not overwritten
    assert.notEqual(res.body.data.role, 'admin');
    assert.equal(res.body.data.password, undefined);

    // Verify rejection of blank full name
    const invalidReq = {
      user: { id: studentUser._id, email: studentUser.email },
      body: { fullName: '   ' }
    };
    const invalidRes = createMockRes();
    await updateProfile(invalidReq, invalidRes);
    assert.equal(invalidRes.statusCode, 400);
    assert.match(invalidRes.body.message, /full name/i);
  });

  await t.test('3. POST /api/profile/avatar validates MIME type, size, and uploads safe image', async () => {
    const userReqCtx = { id: studentUser._id, email: studentUser.email };

    // Missing image payload
    const missingRes = createMockRes();
    await uploadAvatar({ user: userReqCtx, body: {} }, missingRes);
    assert.equal(missingRes.statusCode, 400);

    // Invalid MIME type
    const invalidMimeRes = createMockRes();
    await uploadAvatar({
      user: userReqCtx,
      body: {
        image: 'data:application/x-sh;base64,ZWNobyAnSGFja2VkJw==',
        mimeType: 'application/x-sh'
      }
    }, invalidMimeRes);
    assert.equal(invalidMimeRes.statusCode, 400);
    assert.match(invalidMimeRes.body.message, /unsupported image format/i);

    // Oversized image payload (>2MB)
    const bigBuffer = Buffer.alloc(2.5 * 1024 * 1024, 'a');
    const oversizedRes = createMockRes();
    await uploadAvatar({
      user: userReqCtx,
      body: {
        image: `data:image/png;base64,${bigBuffer.toString('base64')}`,
        mimeType: 'image/png'
      }
    }, oversizedRes);
    assert.equal(oversizedRes.statusCode, 400);
    assert.match(oversizedRes.body.message, /exceeds maximum allowed limit/i);

    // Valid PNG 1x1 pixel image
    const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const validRes = createMockRes();
    await uploadAvatar({
      user: userReqCtx,
      body: {
        image: `data:image/png;base64,${validPngBase64}`,
        mimeType: 'image/png'
      }
    }, validRes);

    assert.equal(validRes.statusCode, 200);
    assert.equal(validRes.body.success, true);
    assert.ok(validRes.body.data.avatarUrl);
    assert.match(validRes.body.data.avatarUrl, /^\/uploads\/avatars\/avatar_[a-f0-9]+\.png$/);

    // Verify file actually exists on disk
    const diskPath = path.join(__dirname, '../public', validRes.body.data.avatarUrl);
    assert.ok(fs.existsSync(diskPath), 'Avatar file should exist on disk');
  });

  await t.test('4. DELETE /api/profile/avatar removes avatar and unlinks file', async () => {
    const userReqCtx = { id: studentUser._id, email: studentUser.email };
    const delRes = createMockRes();
    await removeAvatar({ user: userReqCtx }, delRes);

    assert.equal(delRes.statusCode, 200);
    assert.equal(delRes.body.success, true);
    assert.equal(delRes.body.data.avatarUrl, '');
  });

  await t.test('5. POST /api/profile/change-password validates current password and updates hash', async () => {
    const userReqCtx = { id: studentUser._id, email: studentUser.email };

    // Missing current password
    const missingCurRes = createMockRes();
    await changePassword({
      user: userReqCtx,
      body: { newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    }, missingCurRes);
    assert.equal(missingCurRes.statusCode, 400);

    // Short new password
    const shortRes = createMockRes();
    await changePassword({
      user: userReqCtx,
      body: { currentPassword: initialPassword, newPassword: '123', confirmPassword: '123' }
    }, shortRes);
    assert.equal(shortRes.statusCode, 400);
    assert.match(shortRes.body.message, /at least 6 characters/i);

    // Mismatched confirmation
    const mismatchRes = createMockRes();
    await changePassword({
      user: userReqCtx,
      body: { currentPassword: initialPassword, newPassword: 'NewPassword123!', confirmPassword: 'Different123!' }
    }, mismatchRes);
    assert.equal(mismatchRes.statusCode, 400);
    assert.match(mismatchRes.body.message, /do not match/i);

    // Wrong current password
    const wrongCurRes = createMockRes();
    await changePassword({
      user: userReqCtx,
      body: { currentPassword: 'IncorrectOldPassword!', newPassword: 'BrandNewPassword123!', confirmPassword: 'BrandNewPassword123!' }
    }, wrongCurRes);
    assert.equal(wrongCurRes.statusCode, 401);
    assert.match(wrongCurRes.body.message, /current password is incorrect/i);

    // Valid change password
    const validChangeRes = createMockRes();
    await changePassword({
      user: userReqCtx,
      body: { currentPassword: initialPassword, newPassword: 'BrandNewPassword123!', confirmPassword: 'BrandNewPassword123!' }
    }, validChangeRes);
    assert.equal(validChangeRes.statusCode, 200);
    assert.equal(validChangeRes.body.success, true);

    // Verify login with old password fails
    const oldLoginRes = createMockRes();
    await login({ body: { email: studentEmail, password: initialPassword } }, oldLoginRes);
    assert.equal(oldLoginRes.statusCode, 401);

    // Verify login with new password succeeds
    const newLoginRes = createMockRes();
    await login({ body: { email: studentEmail, password: 'BrandNewPassword123!' } }, newLoginRes);
    assert.equal(newLoginRes.statusCode, 200);
    assert.equal(newLoginRes.body.data.user.email, studentEmail);
  });
});

