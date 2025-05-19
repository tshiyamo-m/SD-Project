jest.setTimeout(20000);
const projectController = require('./ProjectsController');
const ProjectModel = require('../models/ProjectsModel');
const LoginModel = require('../models/LoginModel');
const mongoose = require('mongoose');

// Mock the models and mongoose
jest.mock('../models/ProjectsModel');
jest.mock('../models/LoginModel');
jest.mock('mongoose', () => {
  // Mock Schema constructor
  const mockSchema = function (definition) {
    return definition;
  };

  return {
    Schema: mockSchema,
    model: jest.fn(),
    Types: {
      ObjectId: jest.fn(id => id)
    },
    connection: {
      db: {
        collection: jest.fn().mockReturnThis(),
        findOneAndUpdate: jest.fn()
      }
    }
  };
});

describe('Project Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('submit_project', () => {
    test('should create a new project and return 200 status code', async () => {
      const projectData = {
        owner: 'user123',
        title: 'Test Project',
        description: 'This is a test project',
        field: 'Technology',
        collaborators: ['user456'],
        requirements: 'Some requirements',
        fundingAmount: 1000,
        fundingSource: 'Self-funded',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: 'Active',
        tags: ['test', 'project'],
        skills: ['coding', 'design'],
        Documents: []
      };

      req.body = projectData;

      const mockProject = { ...projectData, _id: 'project123' };
      await projectController.submit_project(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        project_model: mockProject,
        _id: 'project123'
      });
    });
  });

  describe('retrieve_projects', () => {
    test('should retrieve projects by owner id and return 200 status code', async () => {
      const userId = 'user123';
      req.body = { id: userId };

      const mockProjects = [
        { _id: 'project1', title: 'Project 1', owner: userId },
        { _id: 'project2', title: 'Project 2', owner: userId }
      ];

      ProjectModel.find.mockResolvedValue(mockProjects);

      await projectController.retrieve_projects(req, res);

      expect(ProjectModel.find).toHaveBeenCalledWith({ owner: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProjects);
    });

    test('should handle errors and return 400 status code', async () => {
      req.body = { id: 'invalid-id' };
      const error = new Error('Find error');

      await projectController.retrieve_projects(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('get_all_projects', () => {
    test('should retrieve all projects related to user and return them', async () => {
      const userId = 'user123';
      req.body = { id: userId };

      const mockProjects = [
        { _id: 'project1', title: 'Project 1', owner: userId },
        { _id: 'project2', title: 'Project 2', collaborators: [userId] }
      ];

      ProjectModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProjects)
      });

      await projectController.get_all_projects(req, res);

      expect(ProjectModel.find).toHaveBeenCalledWith({
        $or: [
          { owner: userId },
          { collaborators: { $in: [userId] } }
        ]
      });
      expect(res.json).toHaveBeenCalledWith(mockProjects);
    });
  });

  describe('add_project', () => {
    test('should add project to user projects and return updated user', async () => {
      const userData = {
        user_id: 'user123',
        project_id: 'project456'
      };

      req.body = userData;

      const updatedUser = {
        _id: 'user123',
        username: 'testuser',
        projects: ['project123', 'project456']
      };

      LoginModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await projectController.add_project(req, res);

      expect(LoginModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userData.user_id,
        { $push: { projects: userData.project_id } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });
  });
});