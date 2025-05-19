const { submit_review, retrieve_reviews_researcher, get_all_reviews } = require('../controllers/ReviewController');
const ReviewModel = require('../models/ReviewModel');
// Using a simple ObjectId generator instead of mongoose
const generateObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  return timestamp + machineId + processId + counter;
};

// Mock ReviewModel
jest.mock('../models/ReviewModel');

describe('ReviewController Tests', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup request and response objects manually
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Mock console.log to prevent cluttering test output
    console.log = jest.fn();
  });

  describe('submit_review', () => {
    it('should create a new review and return 200 status with review data', async () => {
      // Setup
      const reviewData = {
        projectId: generateObjectId(),
        reviewerId: generateObjectId(),
        rating: 4,
        comment: 'Great project',
        date: new Date().toISOString(),
        type: 'peer'
      };
      
      req.body = reviewData;
      
      const mockReview = {
        ...reviewData,
        _id: generateObjectId()
      };
      
      ReviewModel.create.mockResolvedValue(mockReview);
      
      // Execute
      await submit_review(req, res);
      
      // Assert
      expect(ReviewModel.create).toHaveBeenCalledWith(reviewData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        review_model: mockReview,
        _id: mockReview._id
      });
      expect(console.log).toHaveBeenCalledWith('New Review Created!');
    });
    
    it('should handle errors and return 400 status', async () => {
      // Setup
      const errorMessage = 'Database error';
      ReviewModel.create.mockRejectedValue(new Error(errorMessage));
      
      req.body = {
        projectId: 'invalidId',
        // Missing required fields
      };
      
      // Execute
      await submit_review(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
      expect(console.log).toHaveBeenCalledWith('Could Not Create Review!');
    });
  });
  
  describe('retrieve_reviews_researcher', () => {
    it('should retrieve reviews for a specific project and return 200 status', async () => {
      // Setup
      const projectId = generateObjectId();
      req.body = { id: projectId };
      
      const mockReviews = [
        {
          _id: generateObjectId(),
          projectId,
          reviewerId: generateObjectId(),
          rating: 4,
          comment: 'Great work',
          date: new Date().toISOString(),
          type: 'peer'
        },
        {
          _id: generateObjectId(),
          projectId,
          reviewerId: generateObjectId(),
          rating: 5,
          comment: 'Excellent project',
          date: new Date().toISOString(),
          type: 'supervisor'
        }
      ];
      
      ReviewModel.find.mockResolvedValue(mockReviews);
      
      // Execute
      await retrieve_reviews_researcher(req, res);
      
      // Assert
      expect(ReviewModel.find).toHaveBeenCalledWith({ projectId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });
    
    it('should handle errors and return 400 status', async () => {
      // Setup
      const errorMessage = 'Database error';
      req.body = { id: 'invalidId' };
      
      ReviewModel.find.mockRejectedValue(new Error(errorMessage));
      
      // Execute
      await retrieve_reviews_researcher(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
      expect(console.log).toHaveBeenCalledWith('Could Not Find Reviews!');
    });
  });
  
  describe('get_all_reviews', () => {
    it('should retrieve all reviews and return 200 status', async () => {
      // Setup
      const mockReviews = [
        {
          _id: generateObjectId(),
          projectId: generateObjectId(),
          reviewerId: generateObjectId(),
          rating: 3,
          comment: 'Good project',
          date: new Date().toISOString(),
          type: 'peer'
        },
        {
          _id: generateObjectId(),
          projectId: generateObjectId(),
          reviewerId: generateObjectId(),
          rating: 5,
          comment: 'Outstanding work',
          date: new Date().toISOString(),
          type: 'supervisor'
        }
      ];
      
      ReviewModel.find.mockResolvedValue(mockReviews);
      
      // Execute
      await get_all_reviews(req, res);
      
      // Assert
      expect(ReviewModel.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });
    
    it('should handle errors and return 400 status', async () => {
      // Setup
      const errorMessage = 'Database error';
      ReviewModel.find.mockRejectedValue(new Error(errorMessage));
      
      // Execute
      await get_all_reviews(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
      expect(console.log).toHaveBeenCalledWith('Could Not Find Reviews!');
    });
  });
});