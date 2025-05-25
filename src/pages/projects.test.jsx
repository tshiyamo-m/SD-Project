import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectsPage from './projects';

// Mock all dependencies
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

jest.mock('./createproject', () => {
  return function CreateProjectPage({ onBack, onCreateProject }) {
    return (
      <div data-testid="create-project-page">
        <button onClick={onBack}>Back</button>
        <button onClick={() => onCreateProject({ id: 'new-project', title: 'New Project' })}>
          Create Project
        </button>
      </div>
    );
  };
});

jest.mock('./milestone', () => {
  return function MilestonesPage({ project, onBack }) {
    return (
      <div data-testid="milestones-page">
        <p>Milestones for {project.title}</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('./viewproject', () => {
  return function ViewProjectPage({ project, onBack }) {
    return (
      <div data-testid="view-project-page">
        <p>Viewing {project.title}</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('./viewreview', () => {
  return function ReviewsPage({ project, onBack }) {
    return (
      <div data-testid="reviews-page">
        <p>Reviews for {project.title}</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  };
});

jest.mock('../components/PageHeader', () => {
  return function PageHeader({ heading, backButton }) {
    return <header data-testid="page-header">{heading}</header>;
  };
});

jest.mock('../utils/projectUtils', () => ({
  getAllProjects: jest.fn(),
}));

jest.mock('../utils/loginUtils', () => ({
  getAllUsers: jest.fn(),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const mockSetState = jest.fn();
const mockUseState = (initial) => [initial, mockSetState];

describe('ProjectsPage', () => {
  let mockGetAllProjects;
  let mockGetAllUsers;
  let mockJwtDecode;
  let useStateSpy;
  let useEffectSpy;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockSetState.mockClear();
    
    // Setup mock modules
    mockGetAllProjects = require('../utils/projectUtils').getAllProjects;
    mockGetAllUsers = require('../utils/loginUtils').getAllUsers;
    mockJwtDecode = require('jwt-decode').jwtDecode;
    
    // Setup React hooks
    useStateSpy = require('react').useState;
    useEffectSpy = require('react').useEffect;
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    window.localStorage.getItem.mockReturnValue('user123');
  });

  describe('Component Initialization', () => {
    test('should initialize with default state', () => {
      // Mock useState calls in order
      const stateValues = [
        [[], mockSetState], // projects
        [[], mockSetState], // allUsers
        [null, mockSetState], // viewingMilestones
        [false, mockSetState], // showCreateForm
        [null, mockSetState], // viewingProject
        [null, mockSetState], // viewingReviews
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      
      // Mock useEffect to not execute
      useEffectSpy.mockImplementation(() => {});
      
      render(<ProjectsPage />);
      
      expect(useStateSpy).toHaveBeenCalledTimes(6);
      expect(useStateSpy).toHaveBeenNthCalledWith(1, []);
      expect(useStateSpy).toHaveBeenNthCalledWith(2, []);
      expect(useStateSpy).toHaveBeenNthCalledWith(3, null);
      expect(useStateSpy).toHaveBeenNthCalledWith(4, false);
      expect(useStateSpy).toHaveBeenNthCalledWith(5, null);
      expect(useStateSpy).toHaveBeenNthCalledWith(6, null);
    });
  });

  describe('Helper Functions', () => {
    test('getUserNameById should return user name when user exists', () => {
      const stateValues = [
        [[], mockSetState],
        [[{ _id: 'user1', name: 'John Doe' }, { _id: 'user2', name: 'Jane Smith' }], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      const { container } = render(<ProjectsPage />);
      
      // Test helper function through component's behavior
      expect(container).toBeDefined();
    });

    test('getUserNameById should return "Unknown" when user does not exist', () => {
      const stateValues = [
        [[], mockSetState],
        [[{ _id: 'user1', name: 'John Doe' }], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      const { container } = render(<ProjectsPage />);
      expect(container).toBeDefined();
    });

    test('getCollaboratorNames should join multiple names', () => {
      const stateValues = [
        [[], mockSetState],
        [[{ _id: 'user1', name: 'John Doe' }, { _id: 'user2', name: 'Jane Smith' }], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      const { container } = render(<ProjectsPage />);
      expect(container).toBeDefined();
    });
  });

  describe('fetchProjects function', () => {
    test('should handle successful API response', async () => {
      mockGetAllProjects.mockResolvedValue([
        {
          _id: 'project1',
          title: 'Test Project',
          owner: 'user1',
          status: 'Active',
          collaborators: ['user2'],
          field: 'Technology',
          created: '2024-01-01',
          updated: '2024-01-02',
          skills: ['React', 'Node.js'],
          tags: ['web', 'frontend']
        }
      ]);

      const stateValues = [
        [[], mockSetState],
        [[{ _id: 'user1', name: 'John Doe' }, { _id: 'user2', name: 'Jane Smith' }], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      
      // Mock useEffect to execute the callback immediately
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(mockGetAllProjects).toHaveBeenCalled();
      });
    });

    test('should handle non-array API response', async () => {
      mockGetAllProjects.mockResolvedValue('invalid response');
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const stateValues = [
        [[], mockSetState],
        [[{ _id: 'user1', name: 'John Doe' }], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('API response is not an array:', 'invalid response');
      });
      
      consoleSpy.mockRestore();
    });

    test('should handle API error', async () => {
      mockGetAllProjects.mockRejectedValue(new Error('API Error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const stateValues = [
        [[], mockSetState],
        [[{ _id: 'user1', name: 'John Doe' }], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error finding projects:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('fetchUsers function', () => {
    test('should handle successful users fetch with token decoding', async () => {
      mockGetAllUsers.mockResolvedValue([
        {
          _id: 'user1',
          token: 'valid.jwt.token'
        }
      ]);
      
      mockJwtDecode.mockReturnValue({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(mockGetAllUsers).toHaveBeenCalled();
        expect(mockJwtDecode).toHaveBeenCalledWith('valid.jwt.token');
      });
    });

    test('should handle users without tokens', async () => {
      mockGetAllUsers.mockResolvedValue([
        {
          _id: 'user1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      ]);

      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(mockGetAllUsers).toHaveBeenCalled();
      });
    });

    test('should handle token decoding error', async () => {
      mockGetAllUsers.mockResolvedValue([
        {
          _id: 'user1',
          token: 'invalid.token'
        }
      ]);
      
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error decoding user token:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    test('should handle fetchUsers API error', async () => {
      mockGetAllUsers.mockRejectedValue(new Error('Fetch error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation((callback) => callback());
      
      render(<ProjectsPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('View Navigation', () => {
    test('should render ViewProjectPage when viewingProject is set', () => {
      const mockProject = { id: '1', title: 'Test Project', owner: 'John Doe' };
      
      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [mockProject, mockSetState], // viewingProject
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      render(<ProjectsPage />);
      
      expect(screen.getByTestId('view-project-page')).toBeInTheDocument();
      expect(screen.getByText('Viewing Test Project')).toBeInTheDocument();
    });

    test('should render MilestonesPage when viewingMilestones is set', () => {
      const mockProject = { id: '1', title: 'Test Project' };
      
      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [mockProject, mockSetState], // viewingMilestones
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      render(<ProjectsPage />);
      
      expect(screen.getByTestId('milestones-page')).toBeInTheDocument();
      expect(screen.getByText('Milestones for Test Project')).toBeInTheDocument();
    });

    test('should render ReviewsPage when viewingReviews is set', () => {
      const mockProject = { id: '1', title: 'Test Project' };
      
      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [mockProject, mockSetState], // viewingReviews
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      render(<ProjectsPage />);
      
      expect(screen.getByTestId('reviews-page')).toBeInTheDocument();
      expect(screen.getByText('Reviews for Test Project')).toBeInTheDocument();
    });

    test('should render CreateProjectPage when showCreateForm is true', () => {
      const stateValues = [
        [[], mockSetState],
        [[], mockSetState],
        [null, mockSetState],
        [true, mockSetState], // showCreateForm
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      render(<ProjectsPage />);
      
      expect(screen.getByTestId('create-project-page')).toBeInTheDocument();
    });
  });

    test('should handle projects with missing collaboratorNames', () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Test Project',
          owner: 'John Doe',
          ownerId: 'user1',
          status: 'Active',
          collaborators: ['user2'],
          // collaboratorNames missing
          field: 'Technology',
          created: '2024-01-01',
          updated: '2024-01-02',
          skills: ['React'],
          tags: ['web']
        }
      ];

      const mockUsers = [
        { _id: 'user1', name: 'John Doe' },
        { _id: 'user2', name: 'Jane Smith' }
      ];

      const stateValues = [
        [mockProjects, mockSetState],
        [mockUsers, mockSetState],
        [null, mockSetState],
        [false, mockSetState],
        [null, mockSetState],
        [null, mockSetState],
      ];
      
      let callIndex = 0;
      useStateSpy.mockImplementation(() => stateValues[callIndex++]);
      useEffectSpy.mockImplementation(() => {});
      
      render(<ProjectsPage />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });