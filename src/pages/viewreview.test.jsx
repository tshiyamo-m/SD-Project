import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewsPage from './ReviewsPage';
import { ArrowLeft, Star, StarOff, Send, XCircle, UserCircle, Calendar } from 'lucide-react';

// Mocking fetch calls for the test
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        _id: '1',
        reviewerId: '123',
        projectId: '1',
        rating: 4,
        comment: 'Great project!',
        date: '2025-05-05',
        type: 'Collaborator',
      }
    ]),
  })
);

const initialProject = {
  id: '1',
  title: 'Test Project',
  description: 'A test project description.',
  owner: 'John Doe',
  status: 'Active',
  ownerId: '123',
};

describe('ReviewsPage', () => {

  it('renders project details correctly', () => {
    render(<ReviewsPage project={initialProject} onBack={jest.fn()} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project description.')).toBeInTheDocument();
    expect(screen.getByText('Owner: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });



  it('opens and closes the review form', () => {
    render(<ReviewsPage project={initialProject} onBack={jest.fn()} />);
    
    const addReviewButton = screen.getByText('Add Review');
    fireEvent.click(addReviewButton);

    expect(screen.getByText('Write a Review')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
  });

  it('submits a review correctly', async () => {
    render(<ReviewsPage project={initialProject} onBack={jest.fn()} />);

    const addReviewButton = screen.getByText('Add Review');
    fireEvent.click(addReviewButton);

    const ratingButton = screen.getByText('1');
    fireEvent.click(ratingButton); // Simulate selecting rating 1

    const commentInput = screen.getByPlaceholderText('Share your experience with this project...');
    fireEvent.change(commentInput, { target: { value: 'This project is good.' } });

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/Review', expect.any(Object)));
  });



  it('handles rating change correctly', () => {
    render(<ReviewsPage project={initialProject} onBack={jest.fn()} />);
    
    const addReviewButton = screen.getByText('Add Review');
    fireEvent.click(addReviewButton);

    const ratingButton = screen.getByText('2');
    fireEvent.click(ratingButton);

    const ratingStars = screen.getAllByRole('button');
    expect(ratingStars[1]).toHaveClass('filled');
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = jest.fn();
    render(<ReviewsPage project={initialProject} onBack={onBack} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
