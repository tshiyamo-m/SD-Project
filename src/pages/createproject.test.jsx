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

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2025-12-31' } });
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'AI, urgent' } });
    fireEvent.change(screen.getByLabelText(/required skills/i), { target: { value: 'ML, Python' } });

    fireEvent.click(screen.getByText(/create project/i));

    await waitFor(() => {
      expect(onCreateProject).toHaveBeenCalled();
      expect(onBack).toHaveBeenCalled();
    });
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
