import { useState } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft } from 'lucide-react';
import './projects.css';
import CreateProjectPage from "./createproject";
import MilestonesPage from './milestone';
import ViewProjectPage from './viewproject'; // Import the new component

const ProjectsPage = () => {
    const [projects] = useState([
        {
            id: 1,
            title: "AI-Powered Diagnosis Assistant",
            description: "Developing an AI tool for early diagnosis of respiratory illnesses.",
            owner: "Dr. Jane Doe",
            status: "Ongoing",
            collaborators: ["John Smith", "Alice Lee"],
            field: "Healthcare AI",
            created: "2025-02-01",
            updated: "2025-04-10",
            skills: ["Machine Learning", "Python", "Medical Imaging"],
            tags: ["Urgent", "Healthcare", "AI"]
        },
        {
            id: 2,
            title: "Smart City Traffic Management",
            description: "Real-time traffic analysis system to reduce congestion in urban areas.",
            owner: "Robert Chen",
            status: "Planning",
            collaborators: ["Maria Garcia", "Wei Zhang"],
            field: "Urban Planning",
            created: "2025-03-15",
            updated: "2025-04-12",
            skills: ["IoT", "Data Analysis", "Traffic Modeling"],
            tags: ["Infrastructure", "Smart City", "Analytics"]
        },
        {
            id: 3,
            title: "Sustainable Agriculture Platform",
            description: "Developing a platform that connects small farms with sustainable practices.",
            owner: "Emily Johnson",
            status: "Active",
            collaborators: ["Michael Brown", "Sophia Rodriguez"],
            field: "AgTech",
            created: "2025-01-10",
            updated: "2025-04-05",
            skills: ["Full Stack Development", "GIS", "Sustainability Analysis"],
            tags: ["Agriculture", "Sustainability", "Community"]
        }
    ]);

    const [viewingMilestones, setViewingMilestones] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewingProject, setViewingProject] = useState(null); // New state for viewing a project

    // Handle view transitions
    if (viewingProject) {
        return <ViewProjectPage
            project={viewingProject}
            onBack={() => setViewingProject(null)}
        />;
    }

    if (viewingMilestones) {
        return <MilestonesPage
            project={viewingMilestones}
            onBack={() => setViewingMilestones(null)}
        />;
    }

    if (showCreateForm) {
        return <CreateProjectPage
            onBack={() => setShowCreateForm(false)}
            // onCreateProject={handleCreateProject}
        />;
    }

    // const handleCreateProject = (newProject) => {
    //     setProjects([...projects, newProject]);
    // };

    return (
        <article className="project-page-content">
            <header className="flex justify-between items-center mb-8">
                <header className="header">
                    <hgroup className="header-title-group">
                        <figure className="back-arrow">
                            <ArrowLeft />
                        </figure>
                        <h1 className="page-title">Projects</h1>
                    </hgroup>
                    <menu className="header-menu">
                        <li>
                            <button className="icon-button">
                                <Search size={20} />
                            </button>
                        </li>
                        <li>
                            <button className="icon-button">
                                <Bell size={20} />
                            </button>
                        </li>
                        <li>
                            <button className="user-button">
                                <figure className="user-icon">
                                    <User size={20} />
                                </figure>
                                <mark className="user-name">Monare</mark>
                            </button>
                        </li>
                        <li>
                            <button className="menu-button">
                                <MoreVertical size={20} />
                            </button>
                        </li>
                    </menu>
                </header>
            </header>

            <section className="create-project-section">
                <button
                    className="create-project-button"
                    onClick={() => setShowCreateForm(true)}
                >
                    Create new project
                </button>
            </section>

            <section className="space-y-4">
                {projects.map(project => (
                    <article key={project.id} className="project-card">
                        <header className="project-header">
                            <h2 className="project-title">{project.title}</h2>
                            <hgroup className="project-info-group">
                                <p><strong>Owner:</strong> {project.owner}</p>
                                <p><strong>Status:</strong> {project.status}</p>
                            </hgroup>
                        </header>
                        <p className="project-description">{project.description}</p>
                        <dl className="project-meta">
                            <dt>Collaborators:</dt>
                            <dd>{project.collaborators.join(", ")}.</dd>

                            <dt>Field:</dt>
                            <dd>{project.field}.</dd>
                        </dl>
                        <dl className="project-meta">
                            <dt>Created:</dt>
                            <dd>{project.created}.</dd>

                            <dt>Last updated:</dt>
                            <dd>{project.updated}.</dd>
                        </dl>
                        <dl className="project-meta">
                            <dt>Required skills:</dt>
                            <dd>{project.skills.join(", ")}.</dd>
                        </dl>
                        <dl className="project-meta">
                            <dt>Tags:</dt>
                            <dd>{project.tags.join(", ")}.</dd>
                        </dl>
                        <footer className="project-footer">
                            <button
                                className="milestones-button"
                                onClick={() => setViewingMilestones(project)}
                            >
                                Milestones
                            </button>
                            <button
                                className="view-button"
                                onClick={() => setViewingProject(project)}
                            >
                                View
                            </button>
                        </footer>
                    </article>
                ))}
            </section>
        </article>
    );
}

export default ProjectsPage;