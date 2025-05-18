const mongoose = require('mongoose');
const AddProjectModel = require('./AddProjectModel'); // Adjust path if needed

describe('AddProjects Model', () => {
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

  it('should create a document with valid user_id and project_id', async () => {
    const validDoc = new AddProjectModel({
      user_id: 'user123',
      project_id: 'project456'
    });

    const saved = await validDoc.save();

    expect(saved._id).toBeDefined();
    expect(saved.user_id).toBe('user123');
    expect(saved.project_id).toBe('project456');
  });

  it('should fail to create a document without required fields', async () => {
    const invalidDoc = new AddProjectModel({});

    let error;
    try {
      await invalidDoc.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.user_id).toBeDefined();
    expect(error.errors.project_id).toBeDefined();
  });
});
