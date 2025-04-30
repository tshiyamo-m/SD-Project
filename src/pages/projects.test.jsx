import { render, screen, fireEvent } from '@testing-library/react';
import ProjectsPage from './projects';

const mockOnBack = jest.fn();

const renderComponent = () => render(<ProjectsPage />);

describe('ProjectsPage', () => {
  test('renders page title', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  });

  test('renders create new project button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /create new project/i })).toBeInTheDocument();
  });

  test('renders project cards', () => {
    renderComponent();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  test('opens create project form', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /create new project/i }));
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  test('opens milestones section', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /milestones/i }));
    expect(screen.getByRole('heading', { name: /milestones/i })).toBeInTheDocument();
  });

  test('opens project details section', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(screen.getByRole('heading', { name: /project details/i })).toBeInTheDocument();
  });

  test('renders icons in the header menu', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bell/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /user/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
  });
});
