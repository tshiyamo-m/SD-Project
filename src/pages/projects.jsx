import { useState,useEffect } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft } from 'lucide-react';
import './projects.css';
import CreateProjectPage from "./createproject";
import MilestonesPage from './milestone';
import ViewProjectPage from './viewproject';
import ReviewsPage from './viewreview';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ProjectsPage = () => {
    

    const [projects, setProjects] = useState([]/*[
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
    ]*/);

    useEffect(() => {

        const Id = localStorage.getItem('Mongo_id');
        const fullName = localStorage.getItem('fullName');
        const fetchProjects = async () => {

            try{
                const response = await fetch('/api/Projects/find', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: Id,
                    }),
                    headers: {
                        'Content-Type': 'application/json' 
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to find projects!');
                }/*
                else{
                    const Project_data = await response.json();
                    //const num_projects = data.projects.length                   

                    if (Project_data != null){

                        const Projects_in_Format = [];

                        let id = 1;
                        
                        for (const Project of Project_data){
                            
                            const Project_in_Format = {
                                id: ""+ id,
                                title: Project.title,
                                owner: fullName,
                                status: "Active",
                                collaborators: Project.collaborators,
                                field: Project.field,
                                created: Project.created,
                                updated: Project.updated,
                                skills: Project.skills,
                                tags: Project.tags
                            }
                            Projects_in_Format.push(Project_in_Format);
                            id++;
                        }

                        //return Projects_in_Format;
                        //console.log(Projects_in_Format);
                        setProjects([], Projects_in_Format);
                        
                    }
                    else{
                        console.log("Could not find projects");
                        return [];
                        
                    }
                
                    //What happens if data == null?

                    
                } */
                const Project_data = await response.json();

                if (!Array.isArray(Project_data)) {
                    console.warn('API response is not an array:', Project_data);
                    return [];
                }
                //map data since we are making an async call
                return Project_data.map((project, index) => ({
                    id: project._id,
                    title: project.title,
                    owner: fullName,
                    ownerId: project.owner,
                    status: "Active",
                    collaborators: project.collaborators,
                    field: project.field,
                    created: project.created,
                    updated: project.updated,
                    skills: project.skills,
                    tags: project.tags
                }));

            }
            catch(error) {
                console.error('Error finding projects:', error);
                return [];
            }
        }

        const loadProjects = async () => {
            const projects = await fetchProjects();
            setProjects(projects);
        };
    
        loadProjects();
        


    }, []);
    

    const [viewingMilestones, setViewingMilestones] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewingProject, setViewingProject] = useState(null);
    const [viewingReviews, setViewingReviews] = useState(null); // New state for viewing reviews
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitingProjectId, setInvitingProjectId] = useState(null);
    const [invitingProjectTitle, setInvitingProjectTitle] = useState('');


    const [name, setName] = useState("");

    useEffect(() => {
        // This will only run when the component mounts
        const token = localStorage.getItem('token');
        
        //console.log("token: ", token);

        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                if (decodedUser && decodedUser.name) {
                    const fullName = decodedUser.name.split(" ");
                    setName(fullName[0]);
                    
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                // Handle invalid token (optional: clear the token)
                // localStorage.removeItem("token");
            }
        }
    }, []);

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
    //API call to retrieve other projects from db
    
    //const Projects_From_Db = fetchProjects();


    // New condition for reviews page
    if (viewingReviews) {
        return <ReviewsPage
            project={viewingReviews}
            onBack={() => setViewingReviews(null)}
        />;
    }

    const handleCreateProject = (newProject) => {
        setProjects([...projects, newProject]);
    };

    if (showCreateForm) {
        return <CreateProjectPage
            onBack={() => setShowCreateForm(false)}
            onCreateProject={handleCreateProject}
        />;
    }

    const handleSendInvite = async (e) => {
        e.preventDefault();
        await axios.post('https://wonderful-hill-03610c21e.6.azurestaticapps.net/api/invite', { email: inviteEmail, projectId: invitingProjectId, projectTitle: invitingProjectTitle });
        setShowInviteModal(false);
    };

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
                                <mark className="user-name">{name}</mark>
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
                                className="reviews-button"
                                onClick={() => setViewingReviews(project)}
                            >
                                Reviews
                            </button>
                            <button
                                className="view-button"
                                onClick={() => setViewingProject(project)}
                            >
                                View
                            </button>
                            <button className="invite-button"
                                    onClick={() =>{
                                        setInvitingProjectId(project.id);
                                        setInvitingProjectTitle(project.title);
                                        setShowInviteModal(true); }}
                            >Invite Collaborator</button>
                            {showInviteModal && (
                                <section className="modal-overlay" aria-modal="true" role="dialog">
                                    <article className="modal-content">
                                        <header>
                                            <h2>Invite Collaborator</h2>
                                        </header>

                                        <form onSubmit={handleSendInvite}>
                                            <label htmlFor="inviteEmail">Collaborator's Email:</label>
                                            <input
                                                type="email"
                                                id="inviteEmail"
                                                name="inviteEmail"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                placeholder="Enter email address"
                                                required
                                            />

                                            <footer>
                                                <button type="submit">Send Invite</button>
                                                <button type="button" onClick={() => setShowInviteModal(false)}>Cancel</button>
                                            </footer>
                                        </form>
                                    </article>
                                </section>
                            )}
                        </footer>
                    </article>
                ))}
            </section>
        </article>
    );
}

export default ProjectsPage;