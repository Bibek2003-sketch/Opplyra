process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { maskMongoUri, extractMongoPassword, scrubChunk } = require('../src/utils/sanitizeLog');

test('MongoDB Terminal Output & Credential Redaction Suite', async (t) => {
  await t.test('1. Extracts password accurately from MongoDB connection strings', () => {
    const uri1 = 'mongodb+srv://studentUser:SuperSecret123@cluster0.abc.mongodb.net/opplyra?retryWrites=true';
    assert.equal(extractMongoPassword(uri1), 'SuperSecret123');

    const uri2 = 'mongodb://app_admin:P%40ssw0rd%21@127.0.0.1:27017/opplyra';
    assert.equal(extractMongoPassword(uri2), 'P@ssw0rd!');

    const uriNoPass = 'mongodb://127.0.0.1:27017/opplyra';
    assert.equal(extractMongoPassword(uriNoPass), null);
  });

  await t.test('2. Masks password in mongodb+srv:// Atlas URIs', () => {
    const uri = 'mongodb+srv://bibekMongo123:P5xcm7gQfSkd0VX1@cluster0.suer9at.mongodb.net/opplyra';
    const masked = maskMongoUri(uri);
    assert.equal(masked, 'mongodb+srv://bibekMongo123:******@cluster0.suer9at.mongodb.net/opplyra');
    assert.equal(masked.includes('P5xcm7gQfSkd0VX1'), false);
  });

  await t.test('3. Masks password in standard mongodb:// URIs with port and options', () => {
    const uri = 'mongodb://myUser:SecretPass999@db.internal.net:27017/opplyra?authSource=admin';
    const masked = maskMongoUri(uri);
    assert.equal(masked, 'mongodb://myUser:******@db.internal.net:27017/opplyra?authSource=admin');
    assert.equal(masked.includes('SecretPass999'), false);
  });

  await t.test('4. Redacts password inside complex error logs and messages', () => {
    const errMsg = 'MongooseError: failed to connect to server [cluster0.mongodb.net:27017] via mongodb+srv://dbUser:VeryConfidentialPass@cluster0.mongodb.net/opplyra: connection timed out';
    const scrubbed = maskMongoUri(errMsg);
    assert.ok(scrubbed.includes('mongodb+srv://dbUser:******@cluster0.mongodb.net/opplyra'));
    assert.equal(scrubbed.includes('VeryConfidentialPass'), false);
  });

  await t.test('5. Redacts raw password if present in process.env.MONGODB_URI', () => {
    const testSecret = 'UniqPass987654321';
    process.env.MONGODB_URI = `mongodb+srv://admin:${testSecret}@cluster.mongodb.net/opplyra`;

    const leakAttempt = `Error trace: could not authenticate using secret ${testSecret} against database.`;
    const scrubbed = maskMongoUri(leakAttempt);

    assert.equal(scrubbed.includes(testSecret), false);
    assert.ok(scrubbed.includes('******'));
  });

  await t.test('6. Verifies scrubChunk redacts passwords in strings and Buffers for terminal output', () => {
    const rawStr = 'Connecting to mongodb+srv://demoUser:HiddenTerminalPassword456@cluster.mongodb.net/opplyra\n';
    const scrubbedStr = scrubChunk(rawStr);
    assert.ok(scrubbedStr.includes('mongodb+srv://demoUser:******@cluster.mongodb.net/opplyra'));
    assert.equal(scrubbedStr.includes('HiddenTerminalPassword456'), false);

    const rawBuf = Buffer.from(rawStr);
    const scrubbedBuf = scrubChunk(rawBuf);
    assert.ok(Buffer.isBuffer(scrubbedBuf));
    const decodedBuf = scrubbedBuf.toString('utf8');
    assert.ok(decodedBuf.includes('mongodb+srv://demoUser:******@cluster.mongodb.net/opplyra'));
    assert.equal(decodedBuf.includes('HiddenTerminalPassword456'), false);
  });
});
