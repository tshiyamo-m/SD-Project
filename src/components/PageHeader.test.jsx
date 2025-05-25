import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PageHeader from './PageHeader';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('PageHeader component', () => {
  it('renders with heading text', () => {
    render(<PageHeader heading="Test Page" />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders back button when backButton is true', () => {
    render(<PageHeader heading="Page with Back" backButton={true} />);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('does not render back button when backButton is false', () => {
    render(<PageHeader heading="No Back" />);
    expect(screen.queryByRole('button', { name: /go back/i })).toBeNull();
  });

  it('applies transparent background inline style', () => {
    render(<PageHeader heading="Styled Page" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle('background: transparent');
  });
});
