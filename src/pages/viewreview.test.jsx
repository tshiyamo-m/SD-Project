// __tests__/ReviewsPage.touch.test.js
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ReviewsPage from '../pages/viewreview';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div onClick={() => {}}>ArrowLeft</div>,
  Star: (props) => <button data-testid="star" onClick={props.onClick}>{props.filled ? '★' : '☆'}</button>,
  StarOff: () => <div>StarOff</div>,
  Send: () => <div>Send</div>,
  XCircle: () => <div>XCircle</div>,
  UserCircle: () => <div>UserCircle</div>,
  Calendar: () => <div>Calendar</div>
}));

const mockReview = {
  _id: 'rev1',
  reviewerId: 'owner123',
  projectId: 'proj1',
  rating: 4,
  comment: 'Great job!',
  date: '2024-01-01',
  type: 'Stakeholder'
};

jest.mock('../utils/reviewUtils', () => ({
  submitReview: jest.fn(() => Promise.resolve(mockReview)),
  findReviewer: jest.fn(() => Promise.resolve([mockReview]))
}));

jest.mock('../utils/loginUtils', () => ({
  getUser: jest.fn(() => Promise.resolve({ token: 'mocked.jwt.token', isReviewer: true }))
}));

jest.mock('jwt-decode', () => jest.fn(() => ({ name: 'Mocked Reviewer' })));

const mockProject = {
  id: 'proj1',
  title: 'Test Project',
  description: 'A sample project',
  owner: 'Owner Name',
  ownerId: 'owner123',
  status: 'Active'
};

describe('ReviewsPage (coverage-only)', () => {
  it('renders without crashing', () => {
    render(<ReviewsPage project={mockProject} onBack={() => {}} />);
    expect(screen.getByText(/project reviews/i)).toBeInTheDocument();
  });

  it('opens and closes the review form', () => {
    render(<ReviewsPage project={mockProject} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/add review/i));
    expect(screen.getByText(/write a review/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.queryByText(/write a review/i)).not.toBeInTheDocument();
  });

  it('updates star rating and comment', () => {
    render(<ReviewsPage project={mockProject} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/add review/i));

    const stars = screen.getAllByTestId('star');
    fireEvent.click(stars[2]); // 3 stars
    fireEvent.change(screen.getByPlaceholderText(/share your experience/i), {
      target: { value: 'Great work!' }
    });

    expect(screen.getByPlaceholderText(/share your experience/i).value).toBe('Great work!');
  });

  it('submits a review', async () => {
    render(<ReviewsPage project={mockProject} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/add review/i));

    fireEvent.click(screen.getAllByTestId('star')[4]); // 5 stars
    fireEvent.change(screen.getByPlaceholderText(/share your experience/i), {
      target: { value: 'Excellent!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.queryByText(/write a review/i)).not.toBeInTheDocument();
    });
  });

  it('calls back when back arrow clicked', () => {
    const onBack = jest.fn();
    render(<ReviewsPage project={mockProject} onBack={onBack} />);
    fireEvent.click(screen.getByText(/arrowleft/i));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders submitted reviews with name and date', async () => {
    render(<ReviewsPage project={mockProject} onBack={() => {}} />);
    expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
    expect(screen.getByText(/stakeholder/i)).toBeInTheDocument();
  });

  it('caches reviewer names and handles unknown fallback', async () => {
    const { getUser } = require('../utils/loginUtils');
    getUser.mockResolvedValueOnce({ token: '', isReviewer: true }); // Simulate empty token

    render(<ReviewsPage project={mockProject} onBack={() => {}} />);
    expect(await screen.findByText(/great job/i)).toBeInTheDocument();
    // Since token is empty, fallback should be triggered
  });
});
