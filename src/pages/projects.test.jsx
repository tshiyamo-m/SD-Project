import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProjectsPage from '../pages/projects';
import * as projectUtils from '../utils/projectUtils';
import * as loginUtils from '../utils/loginUtils';
import { jwtDecode } from 'jwt-decode';

// Mock the utilities
jest.mock('../utils/projectUtils');
jest.mock('../utils/loginUtils');
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

// Mock localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn(() => 'mock-user-id');
});

const mockUser = {
  _id: 'user123',
  token: 'mock-token',
  name: 'Test User',
  email: 'test@example.com',
};

const mockProjects = [
  {
    _id: 'proj1',
    title: 'Test Project 1',
    owner: 'user123',
    status: 'Active',
    collaborators: ['user456'],
    field: 'AI',
    created: '2023-01-01',
    updated: '2023-01-05',
    skills: ['React', 'Node'],
    tags: ['tag1', 'tag2'],
  }
];

const mockUsers = [
  mockUser,
  {
    _id: 'user456',
    token: 'mock-token2',
    name: 'Collaborator',
    email: 'collab@example.com',
  }
];

describe('ProjectsPage', () => {
  beforeEach(async () => {
    jwtDecode.mockImplementation(() => ({ name: mockUser.name, email: mockUser.email }));
    loginUtils.getAllUsers.mockResolvedValue(mockUsers);
    projectUtils.getAllProjects.mockResolvedValue(mockProjects);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Test Project 1/i)).toBeInTheDocument();
    });
  });

  it('renders non-empty project title', () => {
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('renders non-empty owner name', () => {
    expect(screen.getByText(/Owner:/)).toHaveTextContent('Test User');
  });

  it('renders non-empty project status', () => {
    expect(screen.getByText(/Status:/)).toHaveTextContent('Active');
  });

  it('renders non-empty collaborators', () => {
    expect(screen.getByText(/Collaborators:/)).toHaveTextContent('Collaborator');
  });

  it('renders non-empty field', () => {
    expect(screen.getByText(/Field:/)).toHaveTextContent('AI');
  });

  it('renders non-empty created and updated dates', () => {
    expect(screen.getByText(/Created:/)).toHaveTextContent('2023-01-01');
    expect(screen.getByText(/Last updated:/)).toHaveTextContent('2023-01-05');
  });

  it('renders non-empty skills', () => {
    expect(screen.getByText(/Required skills:/)).toHaveTextContent('React, Node');
  });

  it('renders non-empty tags', () => {
    expect(screen.getByText(/Tags:/)).toHaveTextContent('tag1, tag2');
  });
});
