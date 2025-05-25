import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Finance from './finance';
import * as financeUtils from '../utils/financeUtils';
import * as projectUtils from '../utils/projectUtils';

jest.mock('../utils/financeUtils');
jest.mock('../utils/projectUtils');

const mockProjects = [
  { _id: '1', title: 'Project A' },
  { _id: '2', title: 'Project B' }
];

const mockFunds = [
  { _id: 'f1', amount: 1000, used: 200, purpose: '1', source: 'Donor A' },
  { _id: 'f2', amount: 500, used: 500, purpose: '2', source: 'Donor B' }
];

describe('Finance Component', () => {
  beforeEach(() => {
    localStorage.setItem('Mongo_id', 'user-123');
    projectUtils.getAllProjects.mockResolvedValue(mockProjects);
    financeUtils.getFinance.mockResolvedValue(mockFunds);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    render(<Finance />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    });
  });


  test('toggles the Add Fund form', async () => {
    render(<Finance />);
    await screen.findByText('Add Fund');
    fireEvent.click(screen.getByText('Add Fund'));
    expect(screen.getByText(/Add New Fund/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(/Add New Fund/)).not.toBeInTheDocument();
  });

  test('adds a new fund when form is submitted', async () => {
    financeUtils.createFinance.mockResolvedValue({ _id: 'new1' });

    render(<Finance />);
    await screen.findByText('Add Fund');
    fireEvent.click(screen.getByText('Add Fund'));

    fireEvent.change(screen.getByPlaceholderText('R4200'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByPlaceholderText('Organization/Person'), {
      target: { value: 'New Donor' }
    });
    fireEvent.change(screen.getByDisplayValue('Select a project'), {
      target: { value: '1' }
    });
  });

  test('handles fetch errors gracefully', async () => {
    financeUtils.getFinance.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<Finance />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    });
  });
});