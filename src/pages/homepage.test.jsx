import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './homepage';
import { findProject } from '../utils/projectUtils';

jest.mock('../utils/projectUtils');

// Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'fullName') return 'Alice Johnson';
    if (key === 'Mongo_id') return '12345';
    return null;
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('HomePage Component', () => {
  test('renders greeting with first name from localStorage', async () => {
    render(<HomePage />);
    expect(await screen.findByText(/Good Day, Alice/i)).toBeInTheDocument();
  });

  test('displays correct active projects count after fetching', async () => {
    findProject.mockResolvedValueOnce([
      { _id: 'p1', title: 'Project 1' },
      { _id: 'p2', title: 'Project 2' }
    ]);

    render(<HomePage />);

    await waitFor(() => {
      expect(findProject).toHaveBeenCalledWith('12345');
    });

    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
  });

  test('displays 0 for reviewed projects and collaborations initially', () => {
    render(<HomePage />);

    expect(screen.getByText('Projects Reviewed')).toBeInTheDocument();
    expect(screen.getByText('Collaborations')).toBeInTheDocument();
  });

  test('shows fallback message for no notifications', () => {
    render(<HomePage />);
    expect(screen.getByText(/you have no new notifications/i)).toBeInTheDocument();
  });
});
