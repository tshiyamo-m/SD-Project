import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewProjectPage from './viewproject';
import * as loginUtils from '../utils/loginUtils';
import * as bucketUtils from '../utils/bucketUtils';
import * as projectUtils from '../utils/projectUtils';

jest.mock('../utils/loginUtils');
jest.mock('../utils/projectUtils');
jest.mock('../utils/bucketUtils');

const mockProject = {
  id: 'proj1',
  title: 'Test Project',
  description: 'A sample project description',
  status: 'Active',
  owner: 'John Doe',
  ownerId: 'owner123',
  field: 'AI',
  created: '2025-01-01',
  updated: '2025-02-01',
  collaborators: [],
  skills: ['React', 'Node.js'],
  tags: ['Web', 'AI'],
};

describe('ViewProjectPage', () => {
  beforeEach(() => {
    localStorage.setItem('fullName', 'John Doe');
    localStorage.setItem('Mongo_id', 'owner123');
  });

  it('renders project title and description', () => {
    render(<ViewProjectPage project={mockProject} onBack={jest.fn()} />);
    expect(screen.getByText('A sample project description')).toBeInTheDocument();
  });

  it('enters edit mode and shows input fields', () => {
    render(<ViewProjectPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
});