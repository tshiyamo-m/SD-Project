const FinanceController = require('../Controllers/FinanceController');
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