const { getUserChats, getAllUsers, startChat } = require('./ChatsController');
const { v4: uuid } = require('uuid');

// Mock uuid
jest.mock('uuid');

// Mock the global users and chats arrays
global.users = [
  { _id: 'user1', name: 'Alice' },
  { _id: 'user2', name: 'Bob' },
  { _id: 'user3', name: 'Charlie' }
];

global.chats = [
  {
    _id: 'chat1',
    members: ['user1', 'user2'],
    messages: []
  },
  {
    _id: 'chat2', 
    members: ['user2', 'user3'],
    messages: []
  }
];

describe('Chat Controller', () => {
  let req, res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getUserChats', () => {
    test('should return user chats', () => {
      req = { user: { _id: 'user1' } };

      getUserChats(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { _id: 'chat1', members: ['user1', 'user2'], messages: [] }
      ]);
    });

    test('should return empty array if user has no chats', () => {
      req = { user: { _id: 'user4' } };

      getUserChats(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getAllUsers', () => {
    test('should return all users except current user', () => {
      req = { user: { _id: 'user1' } };

      getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { _id: 'user2', name: 'Bob' },
        { _id: 'user3', name: 'Charlie' }
      ]);
    });

    test('should return all users except different current user', () => {
      req = { user: { _id: 'user2' } };

      getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { _id: 'user1', name: 'Alice' },
        { _id: 'user3', name: 'Charlie' }
      ]);
    });
  });

  describe('startChat', () => {
    test('should return existing chat if it exists', () => {
      req = {
        user: { _id: 'user1' },
        body: { recipientId: 'user2' }
      };

      startChat(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'chat1',
        members: ['user1', 'user2'],
        messages: []
      });
      expect(global.chats).toHaveLength(2); // No new chat added
    });

    test('should create new chat if none exists', () => {
      uuid.mockReturnValue('new-chat-id');
      req = {
        user: { _id: 'user1' },
        body: { recipientId: 'user3' }
      };

      startChat(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'new-chat-id',
        members: ['user1', 'user3'],
        messages: []
      });
      expect(global.chats).toHaveLength(3); // New chat added
      expect(global.chats[2]).toEqual({
        _id: 'new-chat-id',
        members: ['user1', 'user3'],
        messages: []
      });
    });

    test('should find existing chat regardless of member order', () => {
      req = {
        user: { _id: 'user2' },
        body: { recipientId: 'user1' }
      };

      startChat(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'chat1',
        members: ['user1', 'user2'],
        messages: []
      });
      expect(global.chats).toHaveLength(3); // No new chat added
    });
  });
});