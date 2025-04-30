/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProjectPage from './createproject';

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
);

const setup = () => {
  const onBack = jest.fn();
  const onCreateProject = jest.fn();

  render(<CreateProjectPage onBack={onBack} onCreateProject={onCreateProject} />);

  return { onBack, onCreateProject };
};

describe('CreateProjectPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all essential input fields', () => {
    setup();

    expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/field\/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/requirements/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/collaborators/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/funding amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/funding source/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/required skills/i)).toBeInTheDocument();
  });

  it('adds a collaborator and removes them', () => {
    setup();

    const input = screen.getByPlaceholderText(/add collaborator email/i);
    fireEvent.change(input, { target: { value: 'alice@example.com' } });
    fireEvent.click(screen.getByText(/add/i));

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
  });

  it('calls onBack when back arrow is clicked', () => {
    const { onBack } = setup();

    fireEvent.click(screen.getByRole('img', { hidden: true }));
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onBack when cancel is clicked', () => {
    const { onBack } = setup();

    fireEvent.click(screen.getByText(/cancel/i));
    expect(onBack).toHaveBeenCalled();
  });

  it('fills out the form and submits project', async () => {
    const { onCreateProject, onBack } = setup();

    fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Project description' } });
    fireEvent.change(screen.getByLabelText(/field\/category/i), { target: { value: 'AI' } });
    fireEvent.change(screen.getByLabelText(/requirements/i), { target: { value: 'Python' } });
    fireEvent.change(screen.getByPlaceholderText(/add collaborator email/i), {
      target: { value: 'bob@example.com' }
    });
    fireEvent.click(screen.getByText(/add/i));

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2025-12-31' } });
    fireEvent.change(screen.getByLabelText(/funding amount/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/funding source/i), { target: { value: 'University' } });
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'AI, urgent' } });
    fireEvent.change(screen.getByLabelText(/required skills/i), { target: { value: 'ML, Python' } });

    fireEvent.click(screen.getByText(/create project/i));

    await waitFor(() => {
      expect(onCreateProject).toHaveBeenCalled();
      expect(onBack).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/api/Projects', expect.any(Object));
    });
  });

  it('does not add duplicate collaborator', () => {
    setup();

    const input = screen.getByPlaceholderText(/add collaborator email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/add/i));

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/add/i));

    const items = screen.getAllByText('test@example.com');
    expect(items.length).toBe(1); // only one instance
  });

  it('handles failed project creation gracefully', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, statusText: 'Internal Server Error' })
    );

    const { onCreateProject } = setup();

    fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: 'Broken Project' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Oops' } });
    fireEvent.change(screen.getByLabelText(/field\/category/i), { target: { value: 'Error' } });

    fireEvent.click(screen.getByText(/create project/i));

    await waitFor(() => {
      expect(onCreateProject).toHaveBeenCalled(); // called regardless
    });
  });
});
