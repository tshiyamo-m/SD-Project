import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Finance from '../pages/finance';
import * as financeUtils from '../utils/financeUtils';
import * as projectUtils from '../utils/projectUtils';

// Mock localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn(() => 'mock-user-id');
});

// Mock utility functions
jest.mock('../utils/financeUtils');
jest.mock('../utils/projectUtils');

const mockProjects = [
  { _id: 'proj1', title: 'Project A' },
  { _id: 'proj2', title: 'Project B' }
];

const mockFunds = [
  {
    _id: 'fund1',
    amount: 10000,
    purpose: 'proj1', // ID of Project A
    source: 'Sponsor X',
    used: 3000
  },
  {
    _id: 'fund2',
    amount: 5000,
    purpose: 'proj2',
    source: 'Sponsor Y',
    used: 5000
  }
];

describe('Finance Page', () => {
  beforeEach(async () => {
    projectUtils.getAllProjects.mockResolvedValue(mockProjects);
    financeUtils.getFinance.mockResolvedValue(mockFunds);

    render(<Finance />);

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Finances/i)).toBeInTheDocument();
    });
  });

  it('renders static headings and tabs', () => {
    expect(screen.getByText('Finances')).toBeInTheDocument();
    expect(screen.getByText('Budget Summary')).toBeInTheDocument();
    expect(screen.getByText(/Active Funds/i)).toBeInTheDocument();
    expect(screen.getByText(/Exhausted Funds/i)).toBeInTheDocument();
  });

  it('displays non-empty active fund information', () => {
    expect(screen.getByText(/For: Project A/i)).toBeInTheDocument();
    expect(screen.getByText(/Sponsor X/i)).toBeInTheDocument();
    expect(screen.getByText(/Used:/i)).toBeInTheDocument();
  });

  it('displays non-empty exhausted fund information when tab is clicked', async () => {
    fireEvent.click(screen.getByText(/Exhausted Funds/i));
    await waitFor(() => {
      expect(screen.getByText(/Sponsor Y/i)).toBeInTheDocument();
      expect(screen.getByText(/Fully utilized/i)).toBeInTheDocument();
    });
  });

  it('shows fund form when "Add Fund" button is clicked', () => {
    fireEvent.click(screen.getByText(/Add Fund/i));

    expect(screen.getByPlaceholderText('R4200')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Organization/Person')).toBeInTheDocument();
    expect(screen.getByText(/Select a project/i)).toBeInTheDocument();
  });
});
