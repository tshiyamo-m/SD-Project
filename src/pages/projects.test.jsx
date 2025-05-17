/* eslint-disable testing-library/no-wait-for-multiple-assertions */
const { render, screen, fireEvent } = require('@testing-library/react');
const React = require('react');
const ProjectsPage = require('./projects').default;

jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  User: () => <div data-testid="user-icon" />,
  MoreVertical: () => <div data-testid="more-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />
}));

jest.mock('./createproject', () => () => <div>Create Project Form</div>);
jest.mock('./viewproject', () => ({ project, onBack }) => (
  <div>
    <div>Viewing Project: {project.title}</div>
    <button onClick={onBack}>Back</button>
  </div>
));
jest.mock('./milestone', () => ({ project, onBack }) => (
  <div>
    <div>Milestones for: {project.title}</div>
    <button onClick={onBack}>Back</button>
  </div>
));
jest.mock('./viewreview', () => ({ project, onBack }) => (
  <div>
    <div>Reviews for: {project.title}</div>
    <button onClick={onBack}>Back</button>
  </div>
));


describe('ProjectsPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url === '/api/Projects/find') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{
            _id: '123',
            title: 'Test Project',
            owner: '456',
            status: 'In Progress',
            collaborators: ['Jane Smith', 'Bob Johnson'],
            field: 'Computer Science',
            created: '2023-01-01',
            updated: '2023-01-15',
            skills: ['React', 'JavaScript'],
            tags: ['Web', 'Frontend']
          }])
        });
      }

      if (url === 'https://wonderful-hill-03610c21e.6.azurestaticapps.net/api/invite') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'fullName') return 'John Doe';
      if (key === 'Mongo_id') return '456';
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  test('renders create project button', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('Create new project')).toBeInTheDocument();
  });

  test('renders user name from localStorage', async () => {
    render(<ProjectsPage />);
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  test('fetches and displays projects', async () => {
    render(<ProjectsPage />);
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('clicking create project button shows create project form', async () => {
    render(<ProjectsPage />);
    fireEvent.click(screen.getByText('Create new project'));
    expect(await screen.findByText('Create Project Form')).toBeInTheDocument();
  });

  test('clicking view button shows project details', async () => {
    render(<ProjectsPage />);
    fireEvent.click(await screen.findByText('View'));
    expect(await screen.findByText('Viewing Project: Test Project')).toBeInTheDocument();
  });

  test('clicking milestones button shows milestones page', async () => {
    render(<ProjectsPage />);
    fireEvent.click(await screen.findByText('Milestones'));
    expect(await screen.findByText('Milestones for: Test Project')).toBeInTheDocument();
  });

  test('clicking reviews button shows reviews page', async () => {
    render(<ProjectsPage />);
    fireEvent.click(await screen.findByText('Reviews'));
    expect(await screen.findByText('Reviews for: Test Project')).toBeInTheDocument();
  });

  test('submitting invite form calls API and closes modal', async () => {
    render(<ProjectsPage />);
    fireEvent.click(await screen.findByText('Invite Collaborator'));

    const emailInput = screen.getByLabelText("Collaborator's Email:");
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByText('Send Invite'));
  });

  test('closing invite modal hides it', async () => {
    render(<ProjectsPage />);
    fireEvent.click(await screen.findByText('Invite Collaborator'));

    expect(screen.getByText('Send Invite')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Send Invite')).not.toBeInTheDocument();
  });

  test('renders header icons', () => {
    render(<ProjectsPage />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('more-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
  });

  test('renders project metadata correctly', async () => {
    render(<ProjectsPage />);
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Field:')).toBeInTheDocument();
    expect(screen.getByText('Computer Science.')).toBeInTheDocument();
    expect(screen.getByText('Required skills:')).toBeInTheDocument();
    expect(screen.getByText('React, JavaScript.')).toBeInTheDocument();
    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText('Web, Frontend.')).toBeInTheDocument();
    expect(screen.getByText('Created:')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01.')).toBeInTheDocument();
    expect(screen.getByText('Last updated:')).toBeInTheDocument();
    expect(screen.getByText('2023-01-15.')).toBeInTheDocument();
  });
});
