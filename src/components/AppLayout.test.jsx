import React from 'react';
import { render, screen } from '@testing-library/react';
import AppLayout from './AppLayout';

// Mock useLocation from react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

// Mock Navbar component
jest.mock('./Navbar', () => () => <nav data-testid="navbar">MockNavbar</nav>);

const { useLocation } = require('react-router-dom');

describe('AppLayout', () => {
  const renderLayout = () => {
    render(
      <AppLayout>
        <div data-testid="child">Child content</div>
      </AppLayout>
    );
  };

  it('hides Navbar on "/" path', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    renderLayout();
    expect(screen.queryByTestId('navbar')).toBeNull();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('hides Navbar on "/landing" path', () => {
    useLocation.mockReturnValue({ pathname: '/landing' });
    renderLayout();
    expect(screen.queryByTestId('navbar')).toBeNull();
  });

  it('hides Navbar on admin path', () => {
    useLocation.mockReturnValue({ pathname: '/src/pages/admin_pages/admin' });
    renderLayout();
    expect(screen.queryByTestId('navbar')).toBeNull();
  });

  it('shows Navbar on non-landing, non-admin path', () => {
    useLocation.mockReturnValue({ pathname: '/projects' });
    renderLayout();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies correct class for landing page layout', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    const { container } = render(
      <AppLayout>
        <div>Sample content</div>
      </AppLayout>
    );
    expect(container.querySelector('.content-full-width')).toBeInTheDocument();
  });

  it('applies correct class for page with navbar', () => {
    useLocation.mockReturnValue({ pathname: '/projects' });
    const { container } = render(
      <AppLayout>
        <div>Sample content</div>
      </AppLayout>
    );
    expect(container.querySelector('.content-with-navbar')).toBeInTheDocument();
  });
});
