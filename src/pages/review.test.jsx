/* eslint-disable testing-library/no-node-access */
import { render, screen, fireEvent, within } from '@testing-library/react';
import ReviewerPage from './review';

test('renders proposal cards with a button to review', () => {
  render(<ReviewerPage />);

  // Check that proposal titles are rendered correctly
  const proposalTitles = [
    "Neural Network for Climate Prediction",
    "Quantum Computing Applications in Cryptography",
    "Biodegradable Plastics from Agricultural Waste"
  ];

  proposalTitles.forEach(title => {
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  // Check for the 'Review' button for the first proposal
  const firstProposalCard = screen.getByText(proposalTitles[0]).closest('article');
  const reviewButton = within(firstProposalCard).getByRole('button', { name: /review/i });

  expect(reviewButton).toBeInTheDocument();
});

test('opens review form when clicking on the "Review" button', () => {
  render(<ReviewerPage />);

  // Click on the 'Review' button of the first proposal
  // eslint-disable-next-line testing-library/no-node-access
  const reviewButton = screen.getByText('Neural Network for Climate Prediction').closest('article')
    // eslint-disable-next-line testing-library/no-node-access
    .querySelector('button');

  fireEvent.click(reviewButton);

  // Check if the review form is rendered
  expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/comments/i)).toBeInTheDocument();
});

test('submitting the review updates the proposal status and score', () => {
  render(<ReviewerPage />);

  // Click on the 'Review' button of the first proposal
  const reviewButton = screen.getByText('Neural Network for Climate Prediction').closest('article')
    .querySelector('button');
  fireEvent.click(reviewButton);

  // Fill out the review form
  const scoreInput = screen.getByLabelText(/score/i);
  fireEvent.change(scoreInput, { target: { value: '8' } });

  const commentsInput = screen.getByLabelText(/comments/i);
  fireEvent.change(commentsInput, { target: { value: 'Great potential, needs more work on data accuracy.' } });

  // Click 'Accept Proposal' button
  const acceptButton = screen.getByRole('button', { name: /accept proposal/i });
  fireEvent.click(acceptButton);

  // Verify that the proposal status, score, and comments are updated
  expect(screen.getByText('Accepted')).toBeInTheDocument();
  expect(screen.getByText('8/10')).toBeInTheDocument();
  expect(screen.getByText('Great potential, needs more work on data accuracy.')).toBeInTheDocument();
});

test('filters proposals based on status', () => {
  render(<ReviewerPage />);

  // Initially, all proposals should be displayed
  expect(screen.getByText('Neural Network for Climate Prediction')).toBeInTheDocument();
  expect(screen.getByText('Quantum Computing Applications in Cryptography')).toBeInTheDocument();
  expect(screen.getByText('Biodegradable Plastics from Agricultural Waste')).toBeInTheDocument();

  // Filter by 'Pending Review'
  const pendingButton = screen.getByText(/pending review/i);
  fireEvent.click(pendingButton);

  // Only 'Neural Network for Climate Prediction' should be visible
  expect(screen.getByText('Neural Network for Climate Prediction')).toBeInTheDocument();
  expect(screen.queryByText('Quantum Computing Applications in Cryptography')).toBeNull();
  expect(screen.queryByText('Biodegradable Plastics from Agricultural Waste')).toBeNull();

  // Filter by 'In Progress'
  const inProgressButton = screen.getByText(/in progress/i);
  fireEvent.click(inProgressButton);

  // Only 'Quantum Computing Applications in Cryptography' should be visible
  expect(screen.getByText('Quantum Computing Applications in Cryptography')).toBeInTheDocument();
  expect(screen.queryByText('Neural Network for Climate Prediction')).toBeNull();
  expect(screen.queryByText('Biodegradable Plastics from Agricultural Waste')).toBeNull();

  // Filter by 'Completed'
  const completedButton = screen.getByText(/completed/i);
  fireEvent.click(completedButton);

  // Only 'Biodegradable Plastics from Agricultural Waste' should be visible
  expect(screen.getByText('Biodegradable Plastics from Agricultural Waste')).toBeInTheDocument();
  expect(screen.queryByText('Neural Network for Climate Prediction')).toBeNull();
  expect(screen.queryByText('Quantum Computing Applications in Cryptography')).toBeNull();
});

test('shows score and comments for accepted/rejected proposals', () => {
  render(<ReviewerPage />);

  // Click 'Review' button on the first proposal
  // eslint-disable-next-line testing-library/no-node-access
  const reviewButton = screen.getByText('Neural Network for Climate Prediction').closest('article')
    .querySelector('button');
  fireEvent.click(reviewButton);

  // Fill out the review form
  const scoreInput = screen.getByLabelText(/score/i);
  fireEvent.change(scoreInput, { target: { value: '9' } });

  const commentsInput = screen.getByLabelText(/comments/i);
  fireEvent.change(commentsInput, { target: { value: 'Well thought out and clear goals.' } });

  // Click 'Accept Proposal'
  const acceptButton = screen.getByRole('button', { name: /accept proposal/i });
  fireEvent.click(acceptButton);

  // Go back to the proposal list and check if score and comments are displayed
  expect(screen.getByText('9/10')).toBeInTheDocument();
  expect(screen.getByText('Well thought out and clear goals.')).toBeInTheDocument();
});
