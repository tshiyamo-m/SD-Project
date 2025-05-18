const mongoose = require('mongoose');
const MessageModel = require('./MessageModel');

describe('Message Model', () => {
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

  it('should create a message with required fields', async () => {
    const validMessage = new MessageModel({
      ConvoID: 'convo123',
      text: 'Hello, world!',
      timestamp: '2024-05-01T12:00:00Z'
    });

    const savedMessage = await validMessage.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.ConvoID).toBe('convo123');
    expect(savedMessage.text).toBe('Hello, world!');
    expect(savedMessage.timestamp).toBe('2024-05-01T12:00:00Z');
    expect(savedMessage.createdAt).toBeInstanceOf(Date);
    expect(savedMessage.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a message without optional timestamp field', async () => {
    const messageWithoutTimestamp = new MessageModel({
      ConvoID: 'convo456',
      text: 'No timestamp here.'
    });

    const savedMessage = await messageWithoutTimestamp.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.ConvoID).toBe('convo456');
    expect(savedMessage.text).toBe('No timestamp here.');
    expect(savedMessage.timestamp).toBeUndefined(); // Optional field not provided
  });

  it('should fail to create a message without ConvoID', async () => {
    const invalidMessage = new MessageModel({
      text: 'Missing ConvoID',
      timestamp: '2024-05-01T12:00:00Z'
    });

    let error;
    try {
      await invalidMessage.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.ConvoID).toBeDefined();
  });

  it('should fail to create a message without text', async () => {
    const invalidMessage = new MessageModel({
      ConvoID: 'convo789'
    });

    let error;
    try {
      await invalidMessage.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.text).toBeDefined();
  });
});
