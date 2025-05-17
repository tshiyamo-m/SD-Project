import { render, screen, fireEvent, within } from '@testing-library/react';
import MilestonesPage from './milestone';

const mockProject = { title: 'AI Collaboration' };
const mockOnBack = jest.fn();

const renderComponent = () => render(<MilestonesPage project={mockProject} onBack={mockOnBack} />);

describe('MilestonesPage', () => {
  test('renders page title with project name', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /milestones for ai collaboration/i })).toBeInTheDocument();
  });

  test('renders initial milestones', () => {
    renderComponent();
    expect(screen.getByText(/literature review/i)).toBeInTheDocument();
    expect(screen.getByText(/prototype development/i)).toBeInTheDocument();
  });

  test('toggles milestone completion', () => {
    renderComponent();
  
    const literatureCard = screen.getByText(/literature review/i);
    const toggleButton = within(literatureCard).getByRole('button');
  
    expect(literatureCard).not.toHaveClass('completed');
  
    fireEvent.click(toggleButton);
  
    expect(literatureCard).toHaveClass('completed');
  });

  test('opens and cancels add milestone form', () => {
    renderComponent();
    const toggleBtn = screen.getByRole('button', { name: /add milestone/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('form')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  test('adds new milestone', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    fireEvent.change(screen.getByLabelText(/milestone name/i), {
      target: { value: 'Testing Coverage' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Write complete test suite' },
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2025-07-01' },
    });
    fireEvent.change(screen.getByLabelText(/assigned to/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'In Progress' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
    expect(screen.getByText(/Write complete test suite/i)).toBeInTheDocument();
  });

  test('displays message when no milestones exist', () => {
    const emptyProject = () => {
      const { rerender } = render(<MilestonesPage project={mockProject} onBack={mockOnBack} />);
      rerender(<MilestonesPage project={mockProject} onBack={mockOnBack} />);
    };
    emptyProject();
  });
});
