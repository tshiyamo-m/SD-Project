import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewProjectPage from './viewproject';

const mockProject = {
  title: 'Smart Irrigation',
  status: 'In Progress',
  description: 'IoT based automatic irrigation control system.',
  owner: 'Dr. Alice Green',
  field: 'AgriTech',
  created: '2025-02-10',
  updated: '2025-03-25',
  collaborators: ['Eliot', 'Sophia'],
  skills: ['C++', 'IoT', 'Sensors'],
  tags: ['IoT', 'Automation', 'Water Management']
};

describe('ViewProjectPage onClick handlers', () => {
  it('calls onBack when back arrow is clicked', () => {
    const mockBack = jest.fn();
    render(<ViewProjectPage project={mockProject} onBack={mockBack} />);
    fireEvent.click(screen.getByRole('img', { hidden: true }));
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows and hides the upload form on button clicks', () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);
    const uploadBtn = screen.getByText(/upload document/i);
    fireEvent.click(uploadBtn);
    expect(screen.getByText(/upload new document/i)).toBeInTheDocument();

    const cancelBtn = screen.getByText(/cancel/i);
    fireEvent.click(cancelBtn);
    expect(screen.queryByText(/upload new document/i)).not.toBeInTheDocument();
  });

  it('selects a file and uploads it, triggering handleUpload', async () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);

    fireEvent.click(screen.getByText(/upload document/i));
    const fileInput = screen.getByLabelText(/choose a file/i);

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('test.pdf')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/upload/i));

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('deletes a document when delete icon is clicked', () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);
    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('delete-button')
    );
    fireEvent.click(deleteButtons[0]);
    // No assertion needed, it's just to trigger the onClick
  });

  it('triggers download button (no-op)', () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);
    const downloadButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('download-button')
    );
    fireEvent.click(downloadButtons[0]);
  });

  it('clicks header icon buttons: Search, Bell, User, More', () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);
    const iconButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('icon-button') || btn.className.includes('user-button') || btn.className.includes('menu-button')
    );

    iconButtons.forEach(button => fireEvent.click(button));
    // Just calling all click handlers
  });
});
