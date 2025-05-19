const userController = require('../Controllers/LoginController');
const LoginModel = require('../models/LoginModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('../models/LoginModel');
jest.mock('jsonwebtoken');
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connection: {
    db: {
      collection: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn()
    }
  },
  Types: {
    ObjectId: jest.fn((id) => id)
  }
}));

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('submit_user', () => {
    it('should return 400 if token is invalid', async () => {
      jwt.decode.mockReturnValue(null);
      req.body = { token: 'bad', projects: [] };

      await userController.submit_user(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should return existing user if already in DB', async () => {
      const mockToken = 'token';
      const decoded = { email: 'test@example.com' };
      const existingUser = { token: mockToken };

      jwt.decode.mockReturnValue(decoded);
      LoginModel.find.mockResolvedValue([existingUser]);

      await userController.submit_user({ body: { token: mockToken, projects: [] } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(existingUser);
    });

    it('should create user if not found', async () => {
      const token = 'newToken';
      const decoded = { email: 'new@example.com' };

      jwt.decode.mockReturnValue(decoded);
      LoginModel.find.mockResolvedValue([]);
      LoginModel.create.mockResolvedValue({ token, projects: [] });

      await userController.submit_user({ body: { token, projects: [] } }, res);

      expect(LoginModel.create).toHaveBeenCalledWith({ token, projects: [] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('get_user', () => {
    it('should return user by ID', async () => {
      const user = { _id: '123', token: 'token' };
      req.body.findId = '123';
      LoginModel.findById.mockResolvedValue(user);

      await userController.get_user(req, res);

      expect(LoginModel.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should handle error if user not found', async () => {
      req.body.findId = 'invalid';
      LoginModel.findById.mockRejectedValue(new Error('fail'));

      await userController.get_user(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('get_all_users', () => {
    it('should return all users', async () => {
      const users = [{}, {}];
      LoginModel.find.mockResolvedValue(users);

      await userController.get_all_users(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should handle DB error', async () => {
      LoginModel.find.mockRejectedValue(new Error('db error'));

      await userController.get_all_users(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'db error' });
    });
  });

  describe('update_is_reviewer', () => {
    it('should update isReviewer field', async () => {
      req.body = { userId: '123', isReviewer: true };
      mongoose.connection.db.collection().findOneAndUpdate.mockResolvedValue({ _id: '123' });

      await userController.update_is_reviewer(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: { _id: '123' } });
    });

    it('should handle not found user', async () => {
      mongoose.connection.db.collection().findOneAndUpdate.mockResolvedValue(null);

      await userController.update_is_reviewer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle DB error', async () => {
      mongoose.connection.db.collection().findOneAndUpdate.mockRejectedValue(new Error('update error'));

      await userController.update_is_reviewer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error during update' });
    });
  });

  describe('make_admin', () => {
    it('should update isAdmin field', async () => {
      req.body = { userId: '123', isAdmin: true };
      mongoose.connection.db.collection().findOneAndUpdate.mockResolvedValue({ _id: '123' });

      await userController.make_admin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: { _id: '123' } });
    });

    it('should handle not found user', async () => {
      mongoose.connection.db.collection().findOneAndUpdate.mockResolvedValue(null);

      await userController.make_admin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle DB error', async () => {
      mongoose.connection.db.collection().findOneAndUpdate.mockRejectedValue(new Error('update error'));

      await userController.make_admin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error during update' });
    });
  });

  describe('return_users', () => {
    it('should return users', async () => {
      const users = [{ token: 'abc' }];
      LoginModel.find.mockResolvedValue(users);

      await userController.return_users(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should handle error', async () => {
      LoginModel.find.mockRejectedValue(new Error('fail'));

      await userController.return_users(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});
