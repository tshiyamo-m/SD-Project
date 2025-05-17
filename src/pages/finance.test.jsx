import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Finance from './finance';

describe('Finance Component', () => {
  it('renders initial budget summary correctly', () => {
    render(<Finance />);
    
    expect(screen.getByText(/total spent:/i)).toBeInTheDocument();
    expect(screen.getByText(/r2,200/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining budget:/i)).toBeInTheDocument();
    expect(screen.getByText(/r2,200/i)).toBeInTheDocument();
  });

  it('toggles the fund form visibility', () => {
    render(<Finance />);

    const toggleButton = screen.getByText(/add fund/i);
    fireEvent.click(toggleButton);
    expect(screen.getByText(/amount:/i)).toBeInTheDocument();

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/amount:/i)).not.toBeInTheDocument();
  });

  it('fills out the form and adds a new fund', () => {
    render(<Finance />);
    
    fireEvent.click(screen.getByText(/add fund/i));

    fireEvent.change(screen.getByPlaceholderText(/r4200/i), {
      target: { value: '3000' }
    });
    fireEvent.change(screen.getByPlaceholderText(/to monitor budget usage/i), {
      target: { value: 'New sensors' }
    });
    fireEvent.change(screen.getByPlaceholderText(/organization\/person/i), {
      target: { value: 'TechFund' }
    });

    fireEvent.click(screen.getByText(/^add$/i)); // submit button

    // Check that new fund is added and displayed
    expect(screen.getByText('TechFund')).toBeInTheDocument();
    expect(screen.getByText(/r3,000/i)).toBeInTheDocument();
    expect(screen.getByText(/new sensors/i)).toBeInTheDocument();
    expect(screen.getByText(/used: r0/i)).toBeInTheDocument();
  });

  it('updates summary after adding a fund', () => {
    render(<Finance />);
    
    fireEvent.click(screen.getByText(/add fund/i));
    fireEvent.change(screen.getByPlaceholderText(/r4200/i), {
      target: { value: '3000' }
    });
    fireEvent.change(screen.getByPlaceholderText(/to monitor budget usage/i), {
      target: { value: 'AI Analysis' }
    });
    fireEvent.change(screen.getByPlaceholderText(/organization\/person/i), {
      target: { value: 'AI Foundation' }
    });

    fireEvent.click(screen.getByText(/^add$/i));

    expect(screen.getByText(/r5,200/i)).toBeInTheDocument(); // total budget
    expect(screen.getByText(/r5,200/i)).toBeInTheDocument(); // remaining = 7200 - 2000
  });
});
