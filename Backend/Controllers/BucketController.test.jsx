const { Submit_Document } = require('./BucketController');
const fs = require('fs');
const { EventEmitter } = require('events');

// Mock fs
jest.mock('fs');

// Mock bucket
global.bucket = {
  openUploadStream: jest.fn()
};

describe('Submit_Document', () => {
  let req, res, mockFileStream, mockUploadStream;

  beforeEach(() => {
    req = {
      file: {
        path: '/tmp/test-file.txt',
        originalname: 'test-document.pdf'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockFileStream = new EventEmitter();
    mockFileStream.pipe = jest.fn();

    mockUploadStream = new EventEmitter();
    mockUploadStream.id = 'mock-file-id-123';

    fs.createReadStream.mockReturnValue(mockFileStream);
    fs.unlinkSync.mockImplementation(() => {});
    global.bucket.openUploadStream.mockReturnValue(mockUploadStream);

    jest.clearAllMocks();
  });

  afterEach(() => {
    mockFileStream.removeAllListeners();
    mockUploadStream.removeAllListeners();
  });

  test('should upload file successfully', async () => {
    Submit_Document(req, res);

    setImmediate(() => {
      mockUploadStream.emit('finish');
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(fs.createReadStream).toHaveBeenCalledWith('/tmp/test-file.txt');
    expect(global.bucket.openUploadStream).toHaveBeenCalledWith('test-document.pdf');
    expect(mockFileStream.pipe).toHaveBeenCalledWith(mockUploadStream);
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test-file.txt');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "File uploaded successfully",
      fileId: 'mock-file-id-123',
      filename: 'test-document.pdf'
    });
  });

  test('should handle upload error', async () => {
    Submit_Document(req, res);

    setImmediate(() => {
      mockUploadStream.emit('error', new Error('Upload failed'));
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error uploading file" });
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});