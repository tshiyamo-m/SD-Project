const FinanceController = require('../controllers/FinanceController');
const FinanceModel = require('../models/FinanceModel');
const mongoose = require('mongoose');

// Mock the FinanceModel and mongoose
jest.mock('../models/FinanceModel');
jest.mock('mongoose');

// Mock console.log to avoid console output during tests
console.log = jest.fn();

describe('FinanceController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('submit_finance', () => {
        it('should successfully create a finance record', async () => {
            // Test Case 1: Successful finance record creation
            const mockFinanceRecord = {
                _id: 'mockId123',
                amount: 1000,
                used: 500,
                userId: 'user123',
                source: 'salary',
                purpose: 'expenses'
            };

            req.body = {
                amount: 1000,
                used: 500,
                userId: 'user123',
                source: 'salary',
                purpose: 'expenses'
            };

            FinanceModel.create.mockResolvedValue(mockFinanceRecord);

            await FinanceController.submit_finance(req, res);

            expect(FinanceModel.create).toHaveBeenCalledWith({
                amount: 1000,
                used: 500,
                userId: 'user123',
                source: 'salary',
                purpose: 'expenses'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                finance_model: mockFinanceRecord,
                _id: 'mockId123'
            });
            expect(console.log).toHaveBeenCalledWith('New Finance Record Created!');
        });

        it('should handle finance record creation error', async () => {
            // Test Case 2: Error during finance record creation
            const errorMessage = 'Validation failed';
            req.body = {
                amount: 1000,
                used: 500,
                userId: 'user123',
                source: 'salary',
                purpose: 'expenses'
            };

            FinanceModel.create.mockRejectedValue(new Error(errorMessage));

            await FinanceController.submit_finance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
            expect(console.log).toHaveBeenCalledWith('Could Not Create Finance Record!');
        });
    });

    describe('retrieve_finance', () => {
        it('should successfully retrieve finance records', async () => {
            // Test Case 3: Successful finance records retrieval
            const mockFinanceRecords = [
                { _id: '1', amount: 1000, userId: 'user123' },
                { _id: '2', amount: 2000, userId: 'user123' }
            ];

            req.body = { id: 'user123' };
            FinanceModel.find.mockResolvedValue(mockFinanceRecords);

            await FinanceController.retrieve_finance(req, res);

            expect(FinanceModel.find).toHaveBeenCalledWith({ userId: 'user123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockFinanceRecords);
        });

        it('should handle error when retrieving finance records', async () => {
            // Test Case 4: Error during finance records retrieval
            const errorMessage = 'Database connection failed';
            req.body = { id: 'user123' };

            FinanceModel.find.mockRejectedValue(new Error(errorMessage));

            await FinanceController.retrieve_finance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
            expect(console.log).toHaveBeenCalledWith('Could Not Find Finance Records!');
        });
    });

    describe('update_finance', () => {
        let mockCollection;

        beforeEach(() => {
            mockCollection = {
                findOneAndUpdate: jest.fn()
            };
            mongoose.connection = {
                db: {
                    collection: jest.fn().mockReturnValue(mockCollection)
                }
            };
            mongoose.Types = {
                ObjectId: jest.fn().mockImplementation((id) => ({ id }))
            };
        });

        it('should successfully update finance record', async () => {
            // Test Case 6: Successful finance record update
            const mockUpdatedRecord = {
                _id: 'fund123',
                used: 750,
                amount: 1000
            };

            req.body = {
                id: 'fund123',
                used: 750
            };

            mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedRecord);

            await FinanceController.update_finance(req, res);

            expect(mongoose.connection.db.collection).toHaveBeenCalledWith('Finance');
            expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: { id: 'fund123' } },
                { $set: { used: 750 } },
                { returnDocument: 'after' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                user: mockUpdatedRecord
            });
        });

        it('should handle case when fund is not found', async () => {
            // Test Case 7: Fund not found during update
            req.body = {
                id: 'nonexistentFund',
                used: 500
            };

            mockCollection.findOneAndUpdate.mockResolvedValue(null);

            await FinanceController.update_finance(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Fund not found" });
        });

        it('should handle server error during update', async () => {
            // Test Case 8: Server error during update
            req.body = {
                id: 'fund123',
                used: 750
            };

            const errorMessage = 'Database connection failed';
            mockCollection.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

            // Mock console.error
            const originalConsoleError = console.error;
            console.error = jest.fn();

            await FinanceController.update_finance(req, res);

            expect(console.error).toHaveBeenCalledWith("Update error:", expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Server error during update" });

            // Restore console.error
            console.error = originalConsoleError;
        });

        it('should handle update with different used values', async () => {
            // Test Case 9: Update with zero used value
            const mockUpdatedRecord = {
                _id: 'fund123',
                used: 0,
                amount: 1000
            };

            req.body = {
                id: 'fund123',
                used: 0
            };

            mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedRecord);

            await FinanceController.update_finance(req, res);

            expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: { id: 'fund123' } },
                { $set: { used: 0 } },
                { returnDocument: 'after' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                user: mockUpdatedRecord
            });
        });

        it('should handle update with maximum used value', async () => {
            // Test Case 10: Update with high used value
            const mockUpdatedRecord = {
                _id: 'fund123',
                used: 999999,
                amount: 1000000
            };

            req.body = {
                id: 'fund123',
                used: 999999
            };

            mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedRecord);

            await FinanceController.update_finance(req, res);

            expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: { id: 'fund123' } },
                { $set: { used: 999999 } },
                { returnDocument: 'after' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                user: mockUpdatedRecord
            });
        });
    });
});