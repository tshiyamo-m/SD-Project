jest.setTimeout(20000);
// __tests__/fileManagement.test.js
const { fetchFiles, deleteFile, downloadDoc } = require('./BucketController');

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn()
  },
  connection: {
    db: {
      collection: jest.fn()
    }
  }
}));

// Mock the bucket object (assuming it's from a global scope or import)
global.bucket = {
  delete: jest.fn(),
  openDownloadStream: jest.fn()
};

// Mock ObjectId (assuming it's imported separately)
global.ObjectId = jest.fn();

const mongoose = require('mongoose');

describe('File Management Functions', () => {
  let req, res, mockFind, mockToArray, mockFindOne, mockDownloadStream;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };

    // Mock database collection methods
    mockToArray = jest.fn();
    mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
    mockFindOne = jest.fn();
    
    mongoose.connection.db.collection.mockReturnValue({
      find: mockFind,
      findOne: mockFindOne
    });

    // Mock download stream
    mockDownloadStream = {
      pipe: jest.fn(),
      on: jest.fn()
    };
    
    global.bucket.openDownloadStream.mockReturnValue(mockDownloadStream);

    // Mock console methods to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  describe('deleteFile', () => {
    test('should return error when fileId is missing', async () => {
      req.body = {};
      
      await deleteFile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "fileId is required" });
    });

    test('should successfully delete file', async () => {
      const mockObjectId = { toString: () => '123' };
      mongoose.Types.ObjectId.mockReturnValue(mockObjectId);
      global.bucket.delete.mockResolvedValue();
      
      req.body = { fileId: 'validFileId' };
      
      await deleteFile(req, res);
      
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith('validFileId');
      expect(global.bucket.delete).toHaveBeenCalledWith(mockObjectId);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "File deleted" });
    });

    test('should handle delete error', async () => {
      const mockObjectId = { toString: () => '123' };
      mongoose.Types.ObjectId.mockReturnValue(mockObjectId);
      global.bucket.delete.mockRejectedValue(new Error('Delete failed'));
      
      req.body = { fileId: 'validFileId' };
      
      await deleteFile(req, res);
      
      expect(console.error).toHaveBeenCalledWith("Delete error:", expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete file" });
    });
  });

  describe('fetchFiles', () => {
    test('should return error when projectID is missing', async () => {
      req.body = {};
      
      await fetchFiles(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "projectID is required" });
    });

    test('should return empty array when no files found', async () => {
      const mockObjectId = { toString: () => '123' };
      global.ObjectId.mockReturnValue(mockObjectId);
      mockToArray.mockResolvedValue([]);
      
      req.body = { projectID: 'validProjectId' };
      
      await fetchFiles(req, res);
      
      expect(global.ObjectId).toHaveBeenCalledWith('validProjectId');
      expect(mockFind).toHaveBeenCalledWith({ 'metadata.ProjectId': 'validProjectId' });
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('should return files when found', async () => {
      const mockFiles = [
        { _id: '1', filename: 'file1.txt' },
        { _id: '2', filename: 'file2.txt' }
      ];
      const mockObjectId = { toString: () => '123' };
      global.ObjectId.mockReturnValue(mockObjectId);
      mockToArray.mockResolvedValue(mockFiles);
      
      req.body = { projectID: 'validProjectId' };
      
      await fetchFiles(req, res);
      
      expect(res.json).toHaveBeenCalledWith(mockFiles);
    });

    test('should handle ObjectId error', async () => {
      global.ObjectId.mockImplementation(() => {
        throw new Error('Invalid ObjectId format');
      });
      
      req.body = { projectID: 'invalidProjectId' };
      
      await fetchFiles(req, res);
      
      expect(console.error).toHaveBeenCalledWith('Error retrieving documents:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid projectID format" });
    });

    test('should handle general server error', async () => {
      const mockObjectId = { toString: () => '123' };
      global.ObjectId.mockReturnValue(mockObjectId);
      mockToArray.mockRejectedValue(new Error('Database connection failed'));
      
      req.body = { projectID: 'validProjectId' };
      
      await fetchFiles(req, res);
      
      expect(console.error).toHaveBeenCalledWith('Error retrieving documents:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });

  describe('downloadDoc', () => {
    test('should return error when fileId is missing', async () => {
      req.body = {};
      
      await downloadDoc(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "fileId is required" });
    });

    test('should return error when file not found', async () => {
      const mockObjectId = { toString: () => '123' };
      mongoose.Types.ObjectId.mockReturnValue(mockObjectId);
      mockFindOne.mockResolvedValue(null);
      
      req.body = { fileId: 'validFileId' };
      
      await downloadDoc(req, res);
      
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith('validFileId');
      expect(mockFindOne).toHaveBeenCalledWith({ _id: mockObjectId });
      expect(console.log).toHaveBeenCalledWith("File not found");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "File not found" });
    });

    test('should successfully initiate download', async () => {
      const mockFileInfo = {
        _id: '123',
        filename: 'test-file.pdf'
      };
      const mockObjectId = { toString: () => '123' };
      mongoose.Types.ObjectId.mockReturnValue(mockObjectId);
      mockFindOne.mockResolvedValue(mockFileInfo);
      
      req.body = { fileId: 'validFileId' };
      
      await downloadDoc(req, res);
      
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test-file.pdf"');
      expect(global.bucket.openDownloadStream).toHaveBeenCalledWith(mockObjectId);
      expect(mockDownloadStream.pipe).toHaveBeenCalledWith(res);
      expect(mockDownloadStream.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    test('should handle download stream error', async () => {
      const mockFileInfo = {
        _id: '123',
        filename: 'test-file.pdf'
      };
      const mockObjectId = { toString: () => '123' };
      mongoose.Types.ObjectId.mockReturnValue(mockObjectId);
      mockFindOne.mockResolvedValue(mockFileInfo);
      
      // Mock the error callback to be called immediately
      mockDownloadStream.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback();
        }
      });
      
      req.body = { fileId: 'validFileId' };
      
      await downloadDoc(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error downloading file" });
    });

    test('should handle invalid file ID format error', async () => {
      mongoose.Types.ObjectId.mockImplementation(() => {
        throw new Error('Invalid ObjectId');
      });
      
      req.body = { fileId: 'invalidFileId' };
      
      await downloadDoc(req, res);
      
      expect(console.error).toHaveBeenCalledWith('Error downloading document:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid file ID format" });
    });
  });
});

// Additional test file for edge cases and integration testing
// __tests__/fileManagement.integration.test.js
describe('File Management Integration Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('should handle null files response in fetchFiles', async () => {
    const mockObjectId = { toString: () => '123' };
    global.ObjectId.mockReturnValue(mockObjectId);
    
    const mockToArray = jest.fn().mockResolvedValue(null);
    const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
    
    mongoose.connection.db.collection.mockReturnValue({
      find: mockFind
    });
    
    req.body = { projectID: 'validProjectId' };
    
    await fetchFiles(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No files found for this project" });
  });

  test('should handle file with special characters in filename', async () => {
    const mockFileInfo = {
      _id: '123',
      filename: 'test file (with special chars).pdf'
    };
    const mockObjectId = { toString: () => '123' };
    mongoose.Types.ObjectId.mockReturnValue(mockObjectId);
    
    mongoose.connection.db.collection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockFileInfo)
    });
    
    const mockDownloadStream = {
      pipe: jest.fn(),
      on: jest.fn()
    };
    global.bucket.openDownloadStream.mockReturnValue(mockDownloadStream);
    
    req.body = { fileId: 'validFileId' };
    
    await downloadDoc(req, res);
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition', 
      'attachment; filename="test file (with special chars).pdf"'
    );
  });
});