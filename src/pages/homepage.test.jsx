import { render, waitFor, act } from '@testing-library/react';
import HomePage from './HomePage';

// Mocking localStorage
global.localStorage = {
    getItem: jest.fn((key) => {
        if (key === 'fullName') return 'John Doe';
        if (key === 'Mongo_id') return '12345';
        return null;
    }),
};

// Mocking fetch to avoid actual API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Project A' }]),
    })
);

describe('HomePage', () => {
    // Test: Render the homepage header with greeting message
    it('renders the homepage header with greeting message', () => {
        const { getByText } = render(<HomePage />);
        expect(getByText(/Good Day,/i)).toBeInTheDocument();
    });

    // Test: Render the "Start Research Collabs" section
    it('renders the start research collabs section', () => {
        const { getByText } = render(<HomePage />);
        expect(getByText(/Start Research Collabs/i)).toBeInTheDocument();
    });

    // Test: Render the notifications panel
    it('renders the notifications panel', () => {
        const { getByText } = render(<HomePage />);
        expect(getByText(/Notifications/i)).toBeInTheDocument();
    });

    // Test: Render the "no new notifications" message
    it('renders the no notifications message', () => {
        const { getByText } = render(<HomePage />);
        expect(getByText(/You have no new notifications/i)).toBeInTheDocument();
    });

    // Test: Ensure fetch is called to update the state when the component mounts
    it('fetches and updates the activeProjects state', async () => {
        const { getByText } = render(<HomePage />);
        
        // Wait for the component to finish rendering and updating state
        await waitFor(() => getByText('Good Day, John')); // Ensures rendering is complete
        
        // Check if fetch was called
        expect(global.fetch).toHaveBeenCalledTimes(1); // Ensure fetch was called once
    });

    // Test: Ensure the "View Projects" button is rendered
    it('renders the "View Projects" button', () => {
        const { getByText } = render(<HomePage />);
        expect(getByText('View Projects Page')).toBeInTheDocument();
    });

    // Test: Check initial state when component renders
    it('should render with initial state', () => {
        const { getByText } = render(<HomePage />);
        expect(getByText('Active Projects')).toBeInTheDocument();
        expect(getByText('0')).toBeInTheDocument(); // Initial state should be 0
    });

    // Test: Simulate the state update after fetching projects (active projects)
    it('should update the state when projects are fetched', async () => {
        const { getByText } = render(<HomePage />);
        
        // Wait for the useEffect to complete and state update
        await act(async () => {}); // Wait for useEffect to run

        // Assuming fetch returns a project, check if the active projects count is updated
        expect(getByText('Active Projects')).toBeInTheDocument();
        expect(getByText('1')).toBeInTheDocument(); // Simulating 1 active project
    });
});
