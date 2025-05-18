const mongoose = require('mongoose');
const ProjectModel = require('./ProjectsModel');

describe('Project Model', () => {
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

  it('should create a project with required fields only', async () => {
    const validProject = new ProjectModel({
      owner: 'user123',
      title: 'AI Research'
    });

    const savedProject = await validProject.save();

    expect(savedProject._id).toBeDefined();
    expect(savedProject.owner).toBe('user123');
    expect(savedProject.title).toBe('AI Research');
    expect(savedProject.status).toBe('Planning');
  });

  it('should create a project with optional fields', async () => {
    const fullProject = new ProjectModel({
      owner: 'user456',
      title: 'Climate Study',
      description: 'A long-term environmental research project.',
      field: 'Environmental Science',
      collaborators: ['collab1', 'collab2'],
      requirements: 'Data analysis tools',
      fundingAmount: '10000',
      fundingSource: 'Gov',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      status: 'In Progress',
      tags: ['climate', 'data'],
      skills: ['Python', 'Machine Learning'],
      Documents: ['doc1.pdf', 'doc2.pdf']
    });

    const saved = await fullProject.save();

    expect(saved.collaborators.length).toBe(2);
    expect(saved.tags).toContain('climate');
    expect(saved.skills).toContain('Python');
    expect(saved.status).toBe('In Progress');
  });

  it('should fail to create project if required fields are missing', async () => {
    const invalidProject = new ProjectModel({});

    let error;
    try {
      await invalidProject.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.owner).toBeDefined();
    expect(error.errors.title).toBeDefined();
  });
});
