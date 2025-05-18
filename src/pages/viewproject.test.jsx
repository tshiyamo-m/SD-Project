import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewProjectPage from './viewproject';
import * as loginUtils from '../utils/loginUtils';
import * as bucketUtils from '../utils/bucketUtils';
import * as projectUtils from '../utils/projectUtils';

jest.mock('../utils/loginUtils');
jest.mock('../utils/projectUtils');
jest.mock('../utils/bucketUtils');

const mockProject = {
  id: 'proj1',
  title: 'Test Project',
  description: 'A sample project description',
  status: 'Active',
  owner: 'John Doe',
  ownerId: 'owner123',
  field: 'AI',
  created: '2025-01-01',
  updated: '2025-02-01',
  collaborators: [],
  skills: ['React', 'Node.js'],
  tags: ['Web', 'AI'],
};

describe('ViewProjectPage', () => {
  beforeEach(() => {
    localStorage.setItem('fullName', 'John Doe');
    localStorage.setItem('Mongo_id', 'owner123');
  });

  it('renders project title and description', () => {
    render(<ViewProjectPage project={mockProject} onBack={jest.fn()} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A sample project description')).toBeInTheDocument();
  });

  it('enters edit mode and shows input fields', () => {
    render(<ViewProjectPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('saves edited project changes', async () => {
    const mockUpdateProject = jest.fn().mockResolvedValue({});
    projectUtils.updateProject.mockImplementation(mockUpdateProject);

    render(<ViewProjectPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/edit/i));
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Project' } });

    fireEvent.click(screen.getByText(/save changes/i));
    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalled();
    });
  });

  it('shows collaborators when present', async () => {
    loginUtils.getUser.mockResolvedValue({
      token: 'mockToken',
      isReviewer: true,
    });

    render(<ViewProjectPage project={{ ...mockProject, collaborators: ['123'] }} onBack={jest.fn()} />);
    await waitFor(() => {
      expect(loginUtils.getUser).toHaveBeenCalledWith('123');
    });
  });

  it('uploads a document and refreshes list', async () => {
    const mockUpload = jest.fn().mockResolvedValue();
    const mockFetch = jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'TestDoc.pdf',
        type: 'PDF',
        uploadedBy: 'John Doe',
        uploadDate: '2025-05-01',
        size: '1.0 MB',
      },
    ]);
    bucketUtils.uploadFiles.mockImplementation(mockUpload);
    bucketUtils.fetchFiles.mockImplementation(mockFetch);

    render(<ViewProjectPage project={mockProject} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText(/upload document/i));

    const fileInput = screen.getByLabelText(/choose a file/i);
    const file = new File(['file content'], 'TestDoc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText(/upload/i));
    await waitFor(() => {
      expect(bucketUtils.uploadFiles).toHaveBeenCalled();
      expect(bucketUtils.fetchFiles).toHaveBeenCalled();
      expect(screen.getByText('TestDoc.pdf')).toBeInTheDocument();
    });
  });
});
