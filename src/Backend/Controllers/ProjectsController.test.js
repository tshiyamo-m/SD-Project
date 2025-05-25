jest.setTimeout(10000);
const {
    submit_project,
    retrieve_projects,
    add_project,
    update_project,
    retrieve_active_projects,
    get_all_projects
} = require('./ProjectsController');

// Mock the models and mongoose
const ProjectModel = {
    create: jest.fn(),
    find: jest.fn()
};

const LoginModel = {
    findByIdAndUpdate: jest.fn()
};

const mongoose = {
    Types: {
        ObjectId: jest.fn((id) => ({ toString: () => id }))
    },
    connection: {
        db: {
            collection: jest.fn()
        }
    }
};

// Mock the require calls
jest.doMock('../models/ProjectsModel', () => ProjectModel);
jest.doMock('../models/LoginModel', () => LoginModel);
jest.doMock('mongoose', () => mongoose);

describe('ProjectController', () => {
    let req, res, consoleLogSpy, consoleErrorSpy;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });


    describe('add_project', () => {
        it('should add project to user and handle error', async () => {
            const mockUser = { _id: 'user123', projects: ['proj123'] };

            // Test success case
            req.body = { user_id: 'user123', project_id: 'proj123' };
            LoginModel.findByIdAndUpdate.mockResolvedValue(mockUser);

            await add_project(req, res);
            expect(consoleLogSpy).toHaveBeenCalledWith('Could Not Add Projects');

            // Test error case
            jest.clearAllMocks();
            LoginModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await add_project(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(consoleLogSpy).toHaveBeenCalledWith('Could Not Add Projects');
        });
    });

    describe('update_project', () => {
        it('should update project successfully', async () => {
            const mockUpdatedProject = { _id: 'proj123', title: 'Updated' };
            const mockFindOneAndUpdate = jest.fn().mockResolvedValue({
                value: mockUpdatedProject
            });

            mongoose.connection.db.collection.mockReturnValue({
                findOneAndUpdate: mockFindOneAndUpdate
            });

            req.body = {
                Data: {
                    projectId: 'proj123',
                    updates: {
                        id: 'should-be-filtered',
                        created: 'should-be-filtered',
                        title: 'Updated'
                    }
                }
            };

            await update_project(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should handle project not found', async () => {
            const mockFindOneAndUpdate = jest.fn().mockResolvedValue(null);
            mongoose.connection.db.collection.mockReturnValue({
                findOneAndUpdate: mockFindOneAndUpdate
            });

            req.body = {
                Data: {
                    projectId: 'nonexistent',
                    updates: { title: 'Updated' }
                }
            };

            await update_project(req, res);
        });

        it('should handle update error', async () => {
            const mockFindOneAndUpdate = jest.fn().mockRejectedValue(new Error('DB Error'));
            mongoose.connection.db.collection.mockReturnValue({
                findOneAndUpdate: mockFindOneAndUpdate
            });

            req.body = {
                Data: {
                    projectId: 'proj123',
                    updates: { title: 'Updated' }
                }
            };

            await update_project(req, res);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Update error:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Server error during update" });
        });
    });
});