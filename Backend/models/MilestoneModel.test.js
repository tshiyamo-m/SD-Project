const mongoose = require('mongoose');
const MilestoneModel = require('./MilestoneModel'); // Adjust the path as needed

describe('Milestone Model', () => {
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

  it('should create a milestone with all required fields', async () => {
    const validMilestone = new MilestoneModel({
      name: 'Milestone A',
      description: 'Test description',
      dueDate: '2025-12-31',
      assignedTo: 'user1',
      projectId: 'project123',
      status: 'Completed'
    });

    const savedMilestone = await validMilestone.save();

    expect(savedMilestone._id).toBeDefined();
    expect(savedMilestone.name).toBe('Milestone A');
    expect(savedMilestone.status).toBe('Completed');
  });

  it('should use default status if not provided', async () => {
    const milestoneWithDefault = new MilestoneModel({
      name: 'Milestone B',
      description: 'Another milestone',
      dueDate: '2025-11-01',
      assignedTo: 'user2',
      projectId: 'project456'
    });

    const savedMilestone = await milestoneWithDefault.save();

    expect(savedMilestone.status).toBe('In Progress');
  });

  it('should fail to create milestone without required fields', async () => {
    const invalidMilestone = new MilestoneModel({});

    let error;
    try {
      await invalidMilestone.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.dueDate).toBeDefined();
    expect(error.errors.assignedTo).toBeDefined();
    expect(error.errors.projectId).toBeDefined();
  });
});
