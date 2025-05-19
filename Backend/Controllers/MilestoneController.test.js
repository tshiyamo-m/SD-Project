const mongoose = require('mongoose');
const {
  submit_milestone,
  retrieve_milestone,
  update_status,
} = require('../controllers/milestoneController');
const MilestoneModel = require('../models/MilestoneModel');

// Mock the model methods
jest.mock('../models/MilestoneModel');

describe('Milestone Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // 🧪 1. submit_milestone
  test('submit_milestone should create and return milestone', async () => {
    const fakeMilestone = { _id: 'abc123', name: 'Test' };

    req.body = {
      name: 'Test',
      description: 'desc',
      dueDate: '2025-06-01',
      assignedTo: 'User A',
      projectId: 'proj123',
      status: 'Open',
    };

    MilestoneModel.create.mockResolvedValue(fakeMilestone);

    await submit_milestone(req, res);

    expect(MilestoneModel.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      milestone_model: fakeMilestone,
      _id: 'abc123',
    });
  });

  test('submit_milestone should handle errors', async () => {
    MilestoneModel.create.mockRejectedValue(new Error('DB Error'));

    await submit_milestone(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB Error' });
  });

  // 🧪 2. retrieve_milestone
  test('retrieve_milestone should return milestones by projectId', async () => {
    req.body = { id: 'projX' };
    const fakeMilestones = [{ name: 'm1' }, { name: 'm2' }];
    MilestoneModel.find.mockResolvedValue(fakeMilestones);

    await retrieve_milestone(req, res);

    expect(MilestoneModel.find).toHaveBeenCalledWith({ projectId: 'projX' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeMilestones);
  });

  test('retrieve_milestone should handle errors', async () => {
    MilestoneModel.find.mockRejectedValue(new Error('Fetch error'));

    await retrieve_milestone(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
  });

  // 🧪 3. update_status
  test('update_status should update and return updated milestone', async () => {
    req.body = {
      userId: '507f1f77bcf86cd799439011',
      status: 'Completed',
    };

    const updatedDoc = {
      value: { _id: '507f1f77bcf86cd799439011', status: 'Completed' },
    };

    // Mock Mongoose’s low-level findOneAndUpdate
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn().mockResolvedValue(updatedDoc),
      }),
    };
    mongoose.connection.db = mockDb;

    await update_status(req, res);

    expect(mockDb.collection).toHaveBeenCalledWith('Milestone');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: updatedDoc,
    });
  });

  test('update_status should handle not found', async () => {
    req.body = {
      userId: '507f1f77bcf86cd799439011',
      status: 'Completed',
    };

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn().mockResolvedValue(null),
      }),
    };
    mongoose.connection.db = mockDb;

    await update_status(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Milestone not found' });
  });

  test('update_status should handle server error', async () => {
    req.body = {
      userId: '507f1f77bcf86cd799439011',
      status: 'Completed',
    };

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn().mockRejectedValue(new Error('DB crash')),
      }),
    };
    mongoose.connection.db = mockDb;

    await update_status(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Server error during milestone',
    });
  });
});
