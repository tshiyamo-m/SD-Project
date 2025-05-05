import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewProjectPage from './viewproject';

// Minimal mock data to avoid crashes
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
  tags: ['IoT', 'Automation', 'Water Management'],
  documents: [{ name: 'existing.pdf' }],
};

describe('ViewProjectPage (basic interactions)', () => {

  it('shows upload form on button click and cancels', () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/upload document/i));
    expect(screen.getByText(/upload new document/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.queryByText(/upload new document/i)).not.toBeInTheDocument();
  });

  it('clicks download and delete buttons (no assertion)', () => {
    render(<ViewProjectPage project={mockProject} onBack={() => {}} />);
    const buttons = screen.getAllByRole('button');

    buttons.forEach(btn => fireEvent.click(btn));
  });
});
