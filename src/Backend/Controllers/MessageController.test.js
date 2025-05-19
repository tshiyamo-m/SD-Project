// tests/messageController.test.js

// Create mocks for the models directly
jest.setTimeout(20000);
const mockConversationModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn()
};

const mockMessageModel = {
  find: jest.fn(),
  create: jest.fn()
};

// Mock the modules
jest.mock('../models/ConversationModel', () => mockConversationModel);
jest.mock('../models/MessagesModel', () => mockMessageModel);

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn(id => id)
  }
}));

// Import the controller - the mocks will be used instead of the real models
const messageController = require('../Controllers/MessageController');

describe('Message Controller Tests', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error
    console.log = jest.fn(); // Mock console.log
  });

  describe('Message Controller Functions', () => {
    // Test Case 1: getMessages should return 400 if ConvoID is missing
    test('getMessages should return 400 if ConvoID is missing', () => {
      messageController.getMessages(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "ConvoID required" });
    });

    // Test Case 2: getMessages should return messages when ConvoID is provided
    test('getMessages should return messages when ConvoID is provided', () => {
      req.body = { ConvoID: 'validConvoId' };
      
      const mockMessages = [{ text: 'Hello' }, { text: 'World' }];
      mockMessageModel.find.mockReturnValue(mockMessages);
      
      messageController.getMessages(req, res);
      
      expect(mockMessageModel.find).toHaveBeenCalledWith({ ConvoID: 'validConvoId' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    // Test Case 3: sendMessage should return 400 if required parameters are missing
    test('sendMessage should return 400 if required parameters are missing', async () => {
      // Test with missing text
      req.body = { ConvoID: 'validConvoId' };
      await messageController.sendMessage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      
      // Reset mock calls
      res.status.mockClear();
      res.json.mockClear();
      
      // Test with missing ConvoID
      req.body = { text: 'Hello world' };
      await messageController.sendMessage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    // Test Case 4: sendMessage should create a message and update conversation successfully
    test('sendMessage should create a message and update conversation successfully', async () => {
      req.body = { ConvoID: 'validConvoId', text: 'Hello world' };
      
      const mockConvo = { _id: 'validConvoId' };
      const mockMessage = { _id: 'messageId', ConvoID: 'validConvoId', text: 'Hello world' };
      
      mockConversationModel.findById.mockResolvedValue(mockConvo);
      mockMessageModel.create.mockResolvedValue(mockMessage);
      mockConversationModel.findByIdAndUpdate.mockResolvedValue({ ...mockConvo, lastMessageID: 'messageId' });
      
      await messageController.sendMessage(req, res);
      
      expect(mockMessageModel.create).toHaveBeenCalledWith(expect.objectContaining({
        ConvoID: 'validConvoId',
        text: 'Hello world'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    // Test Case 5: sendMessage should return 404 if conversation is not found
    test('sendMessage should return 404 if conversation is not found', async () => {
      req.body = { ConvoID: 'invalidConvoId', text: 'Hello world' };
      
      mockConversationModel.findById.mockResolvedValue(null);
      
      await messageController.sendMessage(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Could not find the conversation" });
    });

    // Test Case 6: createConversation should return 400 if a user ID is missing
    test('createConversation should return 400 if a user ID is missing', async () => {
      // Test with missing userID_2
      req.body = { userID_1: 'user1' };
      await messageController.createConversation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      
      // Reset mock calls
      res.status.mockClear();
      res.json.mockClear();
      
      // Test with missing userID_1
      req.body = { userID_2: 'user2' };
      await messageController.createConversation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    // Test Case 7: createConversation should create a new conversation when none exists
    test('createConversation should create a new conversation when none exists', async () => {
      req.body = { userID_1: 'user1', userID_2: 'user2' };
      
      const mockConversation = {
        _id: 'convoId',
        userID_1: 'user1',
        userID_2: 'user2',
        lastMessageID: ''
      };
      
      mockConversationModel.findOne.mockResolvedValue(null);
      mockConversationModel.create.mockResolvedValue(mockConversation);
      
      await messageController.createConversation(req, res);
      
      expect(mockConversationModel.create).toHaveBeenCalledWith({
        userID_1: 'user1',
        userID_2: 'user2',
        lastMessageID: ''
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    // Test Case 8: createConversation should return existing conversation if one exists
    test('createConversation should return existing conversation if one exists', async () => {
      req.body = { userID_1: 'user1', userID_2: 'user2' };
      
      const mockConversation = {
        _id: 'convoId',
        userID_1: 'user1',
        userID_2: 'user2'
      };
      
      mockConversationModel.findOne.mockResolvedValue(mockConversation);
      
      await messageController.createConversation(req, res);
      
      expect(mockConversationModel.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockConversation);
    });

    // Test Case 9: retrieveConversations should return 400 if userID is missing
    test('retrieveConversations should return 400 if userID is missing', async () => {
      await messageController.retrieveConversations(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Both user IDs are required" });
    });

    // Test Case 10: retrieveConversations should retrieve conversations for a valid userID
    test('retrieveConversations should retrieve conversations for a valid userID', async () => {
      req.body = { userID: 'user1' };
      
      const mockConversations = [
        { _id: 'convo1', userID_1: 'user1', userID_2: 'user2' },
        { _id: 'convo2', userID_1: 'user3', userID_2: 'user1' }
      ];
      
      const mockMessages = [
        { ConvoID: 'convo1', text: 'Hello' },
        { ConvoID: 'convo1', text: 'World' }
      ];
      
      mockConversationModel.find.mockResolvedValue(mockConversations);
      mockMessageModel.find.mockResolvedValue(mockMessages);
      
      await messageController.retrieveConversations(req, res);
      
      expect(mockConversationModel.find).toHaveBeenCalledWith({
        $or: [
          { userID_1: 'user1' },
          { userID_2: 'user1' }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});