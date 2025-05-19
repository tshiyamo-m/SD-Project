const projectController = require('../controllers/projectController');
const ProjectModel = require('../models/ProjectsModel');
const LoginModel = require('../models/LoginModel');
const mongoose = require('mongoose');

// Mock the models and mongoose
jest.mock('../models/ProjectsModel');
jest.mock('../models/LoginModel');
jest.mock('mongoose', () => {
  const mMongoose = {
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
  return mMongoose;
});

describe('Project Controller Tests', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('submit_project', () => {
    test('should create a new project and return 200 status code', async () => {
      // Mock data and successful response
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
      
      const mockProject = {
        ...projectData,
        _id: 'project123'
      };
      
      ProjectModel.create.mockResolvedValue(mockProject);
      
      await projectController.submit_project(req, res);
      
      expect(ProjectModel.create).toHaveBeenCalledWith(projectData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        project_model: mockProject,
        _id: 'project123'
      });
    });
    
    test('should handle errors and return 400 status code', async () => {
      req.body = { title: 'Incomplete Project' };
      
      const error = new Error('Validation error');
      ProjectModel.create.mockRejectedValue(error);
      
      await projectController.submit_project(req, res);
      
      expect(ProjectModel.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
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
      ProjectModel.find.mockRejectedValue(error);
      
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
    
    test('should handle errors and return 500 status code', async () => {
      req.body = { id: 'user123' };
      
      const error = new Error('Database error');
      ProjectModel.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(error)
      });
      
      await projectController.get_all_projects(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch projects' });
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
    
    test('should handle errors and return 400 status code', async () => {
      req.body = { user_id: 'invalid-id', project_id: 'project1' };
      
      const error = new Error('Update error');
      LoginModel.findByIdAndUpdate.mockRejectedValue(error);
      
      await projectController.add_project(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
  
  describe('update_project', () => {
    test('should update project and return success message', async () => {
      const projectId = 'project123';
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description'
      };
      
      req.body = {
        Data: {
          projectId,
          updates: {
            ...updates,
            id: 'should-be-ignored',
            created: 'should-be-ignored'
          }
        }
      };
      
      const updatedProject = {
        _id: projectId,
        ...updates,
        owner: 'user123'
      };
      
      mongoose.connection.db.collection().findOneAndUpdate.mockResolvedValue({
        value: updatedProject
      });
      
      await projectController.update_project(req, res);
      
      expect(mongoose.connection.db.collection).toHaveBeenCalledWith('Projects');
      expect(mongoose.connection.db.collection().findOneAndUpdate).toHaveBeenCalledWith(
        { _id: projectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        project: updatedProject
      });
    });
    
    test('should handle errors and return 500 status code', async () => {
      req.body = {
        Data: {
          projectId: 'project123',
          updates: { title: 'New Title' }
        }
      };
      
      const error = new Error('Database error');
      mongoose.connection.db.collection().findOneAndUpdate.mockRejectedValue(error);
      
      await projectController.update_project(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error during update' });
    });
  });
});