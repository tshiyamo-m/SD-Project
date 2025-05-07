import { useState,useEffect } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft } from 'lucide-react';
import './projects.css';
import CreateProjectPage from "./createproject";
import MilestonesPage from './milestone';
import ViewProjectPage from './viewproject';
import ReviewsPage from './viewreview';
//import axios from 'axios';
import {jwtDecode} from "jwt-decode";
import { findProject } from '../utils/projectUtils';
import { getAllUsers } from '../utils/loginUtils';

const ProjectsPage = () => {
    
    //const fullName = localStorage.getItem('fullName');
    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    //testable
    const getUserNameById = (userId) => {
        const user = allUsers.find(user => user._id === userId);
        return user ? user.name : 'Unknown';
    };

    //testable
    const getCollaboratorNames = (collaboratorIds) => {
        return collaboratorIds.map(id => getUserNameById(id)).join(", ");
    };

    //testable
    const fetchProjects = async (Id) => {
        try{
            const Project_data = await findProject(Id);
            if (!Array.isArray(Project_data)) {
                console.warn('API response is not an array:', Project_data);
                return [];
            }
            //map data since we are making an async call
            return Project_data.map((project) => ({
                id: project._id,
                title: project.title,
                owner: getUserNameById(project.owner),
                ownerId: project.owner,
                status: project.status,
                collaborators: project.collaborators,
                collaboratorNames: getCollaboratorNames(project.collaborators),
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

    useEffect(() => {
        const Id = localStorage.getItem('Mongo_id');
        //const fullName = localStorage.getItem('fullName');

        const loadProjects = async () => {
            const projects = await fetchProjects(Id);
            setProjects(projects);
        };

        // Only load projects if allUsers is populated
        if (allUsers.length > 0) {
            loadProjects();
        }
    }, [allUsers]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();

            // Process users to decode tokens
            const processUsers = data.map(user => {
                try {
                    if (user.token) {
                        const decoded = jwtDecode(user.token);
                        return {
                            ...user,
                            name: decoded.name,
                            email: decoded.email
                        };
                    }
                    return user;
                } catch (error) {
                    console.error('Error decoding user token:', error);
                    return {
                        ...user,
                        name: 'Unknown',
                        email: 'No email available'
                    };
                }
            });

            setAllUsers(processUsers);

        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    

    const [viewingMilestones, setViewingMilestones] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewingProject, setViewingProject] = useState(null);
    const [viewingReviews, setViewingReviews] = useState(null); // New state for viewing reviews
    // const [showInviteModal, setShowInviteModal] = useState(false);
    // const [inviteEmail, setInviteEmail] = useState('');
    // const [invitingProjectId, setInvitingProjectId] = useState(null);
    // const [invitingProjectTitle, setInvitingProjectTitle] = useState('');
    const [name, setName] = useState("");

    useEffect(() => {
        // This will only run when the component mounts
        const fullName = localStorage.getItem('fullName');
        setName(fullName);
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
    
    // const handleSendInvite = async (e) => {
    //     e.preventDefault();
    //     await axios.post('https://wonderful-hill-03610c21e.6.azurestaticapps.net/api/invite', { email: inviteEmail, projectId: invitingProjectId, projectTitle: invitingProjectTitle });
    //     setShowInviteModal(false);
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
                                <p><strong>Owner:</strong> {project.owner} </p>
                                <p><strong>Status:</strong> {project.status}</p>
                            </hgroup>
                        </header>
                        <p className="project-description">{project.description}</p>
                        <dl className="project-meta">
                            <dt>Collaborators:</dt>
                            <dd>{project.collaboratorNames || getCollaboratorNames(project.collaborators)}</dd>

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
                                onClick={() => {
                                    setViewingProject({...project, owner: project.owner})}}
                            >
                                View
                            </button>
                            {/*<button className="invite-button"*/}
                            {/*        onClick={() =>{*/}
                            {/*            setInvitingProjectId(project.id);*/}
                            {/*            setInvitingProjectTitle(project.title);*/}
                            {/*            setShowInviteModal(true); }}*/}
                            {/*>Invite Collaborator</button>*/}
                            {/*{showInviteModal && (*/}
                            {/*    <section className="modal-overlay" aria-modal="true" role="dialog">*/}
                            {/*        <article className="modal-content">*/}
                            {/*            <header>*/}
                            {/*                <h2>Invite Collaborator</h2>*/}
                            {/*            </header>*/}

                            {/*            <form onSubmit={handleSendInvite}>*/}
                            {/*                <label htmlFor="inviteEmail">Collaborator's Email:</label>*/}
                            {/*                <input*/}
                            {/*                    type="email"*/}
                            {/*                    id="inviteEmail"*/}
                            {/*                    name="inviteEmail"*/}
                            {/*                    value={inviteEmail}*/}
                            {/*                    onChange={(e) => setInviteEmail(e.target.value)}*/}
                            {/*                    placeholder="Enter email address"*/}
                            {/*                    required*/}
                            {/*                />*/}

                            {/*                <footer>*/}
                            {/*                    <button type="submit">Send Invite</button>*/}
                            {/*                    <button type="button" onClick={() => setShowInviteModal(false)}>Cancel</button>*/}
                            {/*                </footer>*/}
                            {/*            </form>*/}
                            {/*        </article>*/}
                            {/*    </section>*/}
                            {/*)}*/}
                        </footer>
                    </article>
                ))}
            </section>
        </article>
    );
}

export default ProjectsPage;