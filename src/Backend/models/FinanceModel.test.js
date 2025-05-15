const mongoose = require('mongoose');
const FinanceModel = require('./FinanceModel'); // adjust path if necessary

describe('Finance Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('should create a finance document with all required fields', async () => {
    const validFinance = new FinanceModel({
      amount: 10000,
      used: 4500,
      userId: 'user123',
      source: 'Grant',
      purpose: 'Equipment'
    });

    const savedFinance = await validFinance.save();

    expect(savedFinance._id).toBeDefined();
    expect(savedFinance.amount).toBe(10000);
    expect(savedFinance.used).toBe(4500);
    expect(savedFinance.userId).toBe('user123');
    expect(savedFinance.source).toBe('Grant');
    expect(savedFinance.purpose).toBe('Equipment');
  });

  it('should create a finance document without optional fields', async () => {
    const financeWithoutOptional = new FinanceModel({
      amount: 2000,
      used: 500,
      userId: 'user456',
    });

    const savedFinance = await financeWithoutOptional.save();

    expect(savedFinance.source).toBeUndefined();
    expect(savedFinance.purpose).toBeUndefined();
  });

  it('should fail to create finance document if required fields are missing', async () => {
    const invalidFinance = new FinanceModel({});

    let error;
    try {
      await invalidFinance.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.amount).toBeDefined();
    expect(error.errors.used).toBeDefined();
    expect(error.errors.userId).toBeDefined();
  });
});
