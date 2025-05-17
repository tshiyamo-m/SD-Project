import { render, waitFor, act, fireEvent, screen } from '@testing-library/react';
import HomePage from './homepage';
import { findProject } from '../utils/projectUtils';

// Mock CSS imports
jest.mock('./homepage.css', () => ({}));

// Mock the imported module
jest.mock('../utils/projectUtils', () => ({
  findProject: jest.fn(),
}));

describe('HomePage', () => {
  // Set up localStorage mock before each test
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default localStorage mock
    global.localStorage = {
      getItem: jest.fn((key) => {
        if (key === 'fullName') return 'John Doe';
        if (key === 'Mongo_id') return '12345';
        return null;
      }),
    };
    
    // Mock console.error to catch and test error handling
    console.error = jest.fn();
  });

  // Test: Render the homepage header with correct name from localStorage
  // Test: Handle array fullName
  // it('handles array fullName by using first element', async () => {
  //   localStorage.getItem.mockImplementation((key) => 
  //     key === 'fullName' ? ['John', 'Doe'] : (key === 'Mongo_id' ? '12345' : null)
  //   );
  //   render(<HomePage />);
    
  //   await waitFor(() => {
  //     expect(screen.getByText('Good Day, John')).toBeInTheDocument();
  //   });
  // });

  // Test: Handle empty string fullName
it('handles empty string fullName', async () => {
  localStorage.getItem.mockImplementation((key) => 
    key === 'fullName' ? '' : (key === 'Mongo_id' ? '12345' : null)
  );
  render(<HomePage />);
  
  await waitFor(() => {
    expect(screen.getByText('Good Day,')).toBeInTheDocument();
  });
});

// Test: Handle multi-word name
it('handles multi-word name by using first name', async () => {
  localStorage.getItem.mockImplementation((key) => 
    key === 'fullName' ? 'John Jacob Doe' : (key === 'Mongo_id' ? '12345' : null)
  );
  render(<HomePage />);
  
  await waitFor(() => {
    expect(screen.getByText('Good Day, John')).toBeInTheDocument();
  });
});

// Test: Handle name processing error
it('handles error when processing name', async () => {
  // Force an error by making getItem return a non-string
  localStorage.getItem.mockImplementation((key) => 
    key === 'fullName' ? { invalid: true } : (key === 'Mongo_id' ? '12345' : null)
  );
  
  render(<HomePage />);
  
  await waitFor(() => {
    expect(console.error).toHaveBeenCalled();
    expect(screen.getByText('Good Day,')).toBeInTheDocument();
  });
});

  // Test: Handle missing fullName in localStorage
  it('handles missing fullName in localStorage', async () => {
    localStorage.getItem.mockImplementation((key) => key === 'Mongo_id' ? '12345' : null);
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Good Day,')).toBeInTheDocument();
    });
  });

  // Test: Handle single-word fullName
  it('handles single-word fullName', async () => {
    localStorage.getItem.mockImplementation((key) => 
      key === 'fullName' ? 'John' : (key === 'Mongo_id' ? '12345' : null)
    );
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Good Day, John')).toBeInTheDocument();
    });
  });

  // Test: Render the "Start Research Collabs" section with all its elements
  it('renders the start research collabs section with all content', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Start Research Collabs')).toBeInTheDocument();
    expect(screen.getByText('The best place for you to create amazing projects with the best people.')).toBeInTheDocument();
    expect(screen.getByText('START YOUR DREAM PROJECT NOW')).toBeInTheDocument();
    expect(screen.getByText('View Projects Page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Projects Page' })).toBeInTheDocument();
  });

  // Test: Verify feature image container renders
  it('renders the feature image container', () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector('.feature-image')).toBeInTheDocument();
  });

  // Test: Initializes all stats to 0
  it('initializes all stats to 0', () => {
    render(<HomePage />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3); // All three stats should be 0 initially
  });

  // Test: Render the stats section with all 3 stat cards
  it('renders all stat cards in the stats section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Projects Reviewed')).toBeInTheDocument();
    expect(screen.getByText('Collaborations')).toBeInTheDocument();
  });

  // Test: Render the notifications panel
  it('renders the notifications panel with no notifications message', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('You have no new notifications')).toBeInTheDocument();
  });

  // Test: Successfully fetch and update activeProjects state
  it('fetches projects and updates activeProjects count', async () => {
    // Mock successful project fetch - ensuring array is returned
    findProject.mockResolvedValue([
      { id: 1, name: 'Project A' },
      { id: 2, name: 'Project B' }
    ]);
    
    render(<HomePage />);
    
    // Wait for the component to update after the mock API call
    await waitFor(() => {
      expect(findProject).toHaveBeenCalledWith('12345');
      expect(screen.getByText('2')).toBeInTheDocument(); // Should show 2 active projects
      // Verify other stats remain unchanged
      expect(screen.getAllByText('0').length).toBe(2);
    });
  });

  // Test: Handle API error gracefully
  it('handles API errors gracefully when fetching projects', async () => {
    // Mock failed project fetch
    findProject.mockRejectedValue(new Error('API error'));
    
    render(<HomePage />);
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(findProject).toHaveBeenCalledWith('12345');
      expect(console.error).toHaveBeenCalledWith('Error finding projects:', expect.any(Error));
      // Verify stats remain at initial values
      expect(screen.getAllByText('0').length).toBe(3);
    });
  });

  // Test: Handle empty project data
  it('handles null project data correctly', async () => {
    // Mock null project data
    findProject.mockResolvedValue(null);
    
    render(<HomePage />);
    
    await waitFor(() => {
      expect(findProject).toHaveBeenCalledWith('12345');
      // Stats should remain at initial value
      expect(screen.getAllByText('0').length).toBe(3);
    });
  });

  // Test: Handle empty array project data
  it('handles empty array project data correctly', async () => {
    // Mock empty array project data
    findProject.mockResolvedValue([]);
    
    render(<HomePage />);
    
    await waitFor(() => {
      expect(findProject).toHaveBeenCalledWith('12345');
      expect(screen.getByText('0')).toBeInTheDocument(); // Active projects should be 0
    });
  });

  // Test: Verify button click handlers
  it('renders clickable View Projects button', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'View Projects Page' });
    
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    // Add actual navigation test when functionality is implemented
  });
  
  // Test: Verify both useEffects are called
  it('calls both useEffects on component mount', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      // Verify localStorage was accessed by both useEffects
      expect(localStorage.getItem).toHaveBeenCalledWith('fullName');
      expect(localStorage.getItem).toHaveBeenCalledWith('Mongo_id');
      
      // Verify findProject was called by the second useEffect
      expect(findProject).toHaveBeenCalledWith('12345');
    });
  });

  // Test: Handles corrupted localStorage
  it('handles error when localStorage is corrupted', async () => {
    localStorage.getItem.mockImplementation(() => { throw new Error('Corrupted') });
    render(<HomePage />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      // Component should still render
      expect(screen.getByText('Start Research Collabs')).toBeInTheDocument();
    });
  });
});