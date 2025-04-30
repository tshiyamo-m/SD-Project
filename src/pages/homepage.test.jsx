import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './homepage';

describe('HomePage', () => {
  test('renders greeting with username', () => {
    render(<HomePage />);
    const greeting = screen.getByRole('heading', { name: /good day, monare/i });
    expect(greeting).toBeInTheDocument();
  });

  test('renders feature section with title and description', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /start research collabs/i })).toBeInTheDocument();
    expect(screen.getByText(/create amazing projects/i)).toBeInTheDocument();
    expect(screen.getByText(/start your dream project now/i)).toBeInTheDocument();
  });

  test('renders View Projects button', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: /view projects page/i });
    expect(button).toBeInTheDocument();
  });

  test('renders all three stat cards with correct values', () => {
    render(<HomePage />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    
    expect(screen.getByText(/active projects/i)).toBeInTheDocument();
    expect(screen.getByText(/projects reviewed/i)).toBeInTheDocument();
    expect(screen.getByText(/collaborations/i)).toBeInTheDocument();
  });

  test('renders notifications panel with default message', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/you have no new notifications/i)).toBeInTheDocument();
  });
});
