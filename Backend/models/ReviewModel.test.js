const mongoose = require('mongoose');
const ReviewModel = require('./ReviewModel');

describe('Review Model', () => {
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

  it('should create a review document with required fields', async () => {
    const review = new ReviewModel({
      projectId: 'proj123',
      reviewerId: 'rev456',
      rating: 4,
      comment: 'Well done!',
      date: '2025-05-10',
      type: 'Final'
    });

    const saved = await review.save();

    expect(saved._id).toBeDefined();
    expect(saved.projectId).toBe('proj123');
    expect(saved.reviewerId).toBe('rev456');
    expect(saved.rating).toBe(4);
    expect(saved.comment).toBe('Well done!');
    expect(saved.date).toBe('2025-05-10');
    expect(saved.type).toBe('Final');
  });

  it('should fail to create a review without projectId and reviewerId', async () => {
    const review = new ReviewModel({
      rating: 5
    });

    let err;
    try {
      await review.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.projectId).toBeDefined();
    expect(err.errors.reviewerId).toBeDefined();
  });
});
