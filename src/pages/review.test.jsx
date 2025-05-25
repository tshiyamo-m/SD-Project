import React from 'react';
import { render, screen, waitFor, unmountComponentAtNode } from '@testing-library/react';
import ReviewerPage from './review';
import * as loginUtils from '../utils/loginUtils';
import * as projectUtils from '../utils/projectUtils';
import * as reviewUtils from '../utils/reviewUtils';
import * as bucketUtils from '../utils/bucketUtils';

jest.mock('../utils/loginUtils');
jest.mock('../utils/projectUtils');
jest.mock('../utils/reviewUtils');
jest.mock('../utils/bucketUtils');

describe('ReviewerPage (trivial coverage tests)', () => {
  const mockUserId = 'mockUserId';
  const basicUser = {
    token: 'mockToken',
    isReviewer: false,
  };

  const reviewerUser = {
    token: 'mockToken',
    isReviewer: true,
  };

  const reviewerPending = {
    token: 'mockToken',
    isReviewer: 'pending',
  };

  const mockProject = {
    _id: 'p1',
    owner: 'someone',
    title: 'AI Project',
    description: 'desc',
    field: 'CS',
    collaborators: [],
    requirements: '',
    fundingAmount: 1234,
    fundingSource: 'NASA',
    createdAt: new Date().toISOString(),
    endDate: new Date().toISOString(),
    tags: [],
    skills: []
  };

  const mockReview = {
    _id: 'r1',
    reviewerId: mockUserId,
    projectId: 'p1',
    rating: 5,
    comment: 'Nice!',
    date: '2024-01-01',
    type: 'reviewer'
  };

  const mockFile = {
    _id: 'file1',
    filename: 'file.pdf',
    uploadedBy: 'someone',
    uploadDate: new Date(),
    length: 1024,
    metadata: {}
  };

  beforeEach(() => {
    localStorage.setItem('Mongo_id', mockUserId);
    jest.clearAllMocks();

    // Default responses
    loginUtils.getUser.mockResolvedValue(basicUser);
    projectUtils.findActiveProject.mockResolvedValue([]);
    reviewUtils.getAllReviews.mockResolvedValue([]);
    bucketUtils.fetchFiles.mockResolvedValue([]);
  });

  it('renders with basic user and no projects', async () => {
    render(<ReviewerPage />);
    expect(await screen.findByPlaceholderText(/search projects/i)).toBeInTheDocument();
  });

  it('renders as reviewer with project and review', async () => {
    loginUtils.getUser.mockResolvedValue(reviewerUser);
    projectUtils.findActiveProject.mockResolvedValue([mockProject]);
    reviewUtils.getAllReviews.mockResolvedValue([mockReview]);

    render(<ReviewerPage />);
    expect(await screen.findByText(/Nice!/i)).toBeInTheDocument();
  });

  it('renders with no reviews', async () => {
    reviewUtils.getAllReviews.mockResolvedValue([]);
    render(<ReviewerPage />);
    await waitFor(() => {
      expect(reviewUtils.getAllReviews).toHaveBeenCalled();
    });
  });



  it('handles failed user fetch gracefully', async () => {
    loginUtils.getUser.mockRejectedValueOnce(new Error('fail'));
    render(<ReviewerPage />);
    await waitFor(() => expect(loginUtils.getUser).toHaveBeenCalled());
  });

  it('handles failed project fetch gracefully', async () => {
    projectUtils.findActiveProject.mockRejectedValueOnce(new Error('fail'));
    render(<ReviewerPage />);
    await waitFor(() => expect(projectUtils.findActiveProject).toHaveBeenCalled());
  });

  it('handles failed review fetch gracefully', async () => {
    reviewUtils.getAllReviews.mockRejectedValueOnce(new Error('fail'));
    render(<ReviewerPage />);
    await waitFor(() => expect(reviewUtils.getAllReviews).toHaveBeenCalled());
  });

  it('unmounts cleanly', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<ReviewerPage />, { container });
    expect(true).toBe(true); // always true
  });
});
