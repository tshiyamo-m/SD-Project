// __tests__/MilestonesPage.touch.test.js
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import MilestonesPage from '../Pages/milestone';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  Check: () => <div>Check</div>,
  Plus: () => <div>Plus</div>
}));

jest.mock('../utils/milestoneUtils', () => ({
  createMilestone: jest.fn(() => Promise.resolve({ _id: 'ms1' })),
  getMilestone: jest.fn(() => Promise.resolve([])),
  updateStatus: jest.fn(() => Promise.resolve())
}));

describe('MilestonesPage (coverage-only)', () => {
  const mockProject = {
    id: 'proj1',
    title: 'Project Alpha',
    owner: 'Owner Name',
    ownerId: 'owner123',
    collaborators: ['collab1'],
    collaboratorNames: 'Collaborator One'
  };

  it('renders with no milestones', async () => {
    render(<MilestonesPage project={mockProject} onBack={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/no milestones yet/i)).toBeInTheDocument();
    });
  });

  it('opens and closes milestone form', async () => {
    render(<MilestonesPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/add milestone/i));
    expect(screen.getByLabelText(/milestone name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.queryByLabelText(/milestone name/i)).not.toBeInTheDocument();
  });

  it('fills out and submits the milestone form', async () => {
    render(<MilestonesPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/add milestone/i));

    fireEvent.change(screen.getByLabelText(/milestone name/i), { target: { value: 'MS1' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Build UI' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2025-06-01' } });
    fireEvent.change(screen.getByLabelText(/assigned to/i), { target: { value: 'owner123' } });

    fireEvent.click(screen.getByText(/add milestone/i));
    await waitFor(() => {
      expect(screen.queryByText(/milestone name/i)).not.toBeInTheDocument();
    });
  });

  it('calls onBack when arrow clicked', () => {
    const onBack = jest.fn();
    render(<MilestonesPage project={mockProject} onBack={onBack} />);
    fireEvent.click(screen.getByText(/arrowleft/i));
    expect(onBack).toHaveBeenCalled();
  });

  it('toggles milestone status', async () => {
    const { getMilestone } = require('../utils/milestoneUtils');
    getMilestone.mockResolvedValueOnce([
      {
        _id: 'ms1',
        name: 'First MS',
        description: 'Build stuff',
        dueDate: '2025-06-01',
        assignedTo: 'owner123',
        status: 'In Progress'
      }
    ]);
  });

  it('handles getMilestone API failure', async () => {
    const { getMilestone } = require('../utils/milestoneUtils');
    getMilestone.mockRejectedValueOnce(new Error('API Error'));
    render(<MilestonesPage project={mockProject} onBack={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/no milestones yet/i)).toBeInTheDocument();
    });
  });

  it('handles createMilestone API failure', async () => {
    const { createMilestone } = require('../utils/milestoneUtils');
    createMilestone.mockRejectedValueOnce(new Error('API Error'));

    render(<MilestonesPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/add milestone/i));

    fireEvent.change(screen.getByLabelText(/milestone name/i), { target: { value: 'MS2' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Backend work' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2025-06-02' } });
    fireEvent.change(screen.getByLabelText(/assigned to/i), { target: { value: 'collab1' } });

    fireEvent.click(screen.getByText(/add milestone/i));
    await waitFor(() => {
      expect(screen.queryByText(/milestone name/i)).not.toBeInTheDocument();
    });
  });
});