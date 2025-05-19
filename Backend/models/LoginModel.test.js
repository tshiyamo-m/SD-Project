const mongoose = require('mongoose');
const { Schema } = mongoose;
const LoginModel = require('./LoginModel');

describe('Login Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('should create a login document with required fields', async () => {
    const validLogin = new LoginModel({
      token: 'abc123',
      projects: ['proj1', 'proj2']
    });

    const savedLogin = await validLogin.save();

    expect(savedLogin._id).toBeDefined();
    expect(savedLogin.token).toBe('abc123');
    expect(savedLogin.projects).toEqual(['proj1', 'proj2']);
    expect(savedLogin.isReviewer).toBe('false');
    expect(savedLogin.isAdmin).toBe(false);
  });

  it('should fail to create login without token', async () => {
    const invalidLogin = new LoginModel({
      projects: ['proj1']
    });

    let err;
    try {
      await invalidLogin.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.token).toBeDefined();
  });

  it('should create a login with custom isReviewer value', async () => {
    const loginWithReviewer = new LoginModel({
      token: 'rev123',
      projects: ['projX'],
      isReviewer: 'true'
    });

    const savedLogin = await loginWithReviewer.save();

    expect(savedLogin._id).toBeDefined();
    expect(savedLogin.token).toBe('rev123');
    expect(savedLogin.projects).toEqual(['projX']);
    expect(savedLogin.isReviewer).toBe('true');
    expect(savedLogin.isAdmin).toBe(false);
  });
});
