import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from './landingpage';


jest.mock('../assets/logo.png', () => 'mocked-logo.png');
jest.mock('../components/login', () => () => <button>Login</button>);

describe('LandingPage', () => {
  test('renders logo in the topbar', () => {
    render(<LandingPage />);
    const logo = screen.getAllByAltText(/logo/i);
    expect(logo.length).toBeGreaterThan(0);
  });

  test('renders navigation links', () => {
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /features/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /why us/i })).toBeInTheDocument();
  });

  test('renders login button component', () => {
    render(<LandingPage />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('renders hero section with heading and text', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { name: /research, collaborate, and innovate/i })).toBeInTheDocument();
    expect(screen.getByText(/find the best/i)).toBeInTheDocument();
    expect(screen.getByText(/work with the best/i)).toBeInTheDocument();
    expect(screen.getByText(/produce the best/i)).toBeInTheDocument();
  });

  test('renders hero logo image', () => {
    render(<LandingPage />);
    const heroLogo = screen.getByAltText(/u-collab logo/i);
    expect(heroLogo).toBeInTheDocument();
  });
});
