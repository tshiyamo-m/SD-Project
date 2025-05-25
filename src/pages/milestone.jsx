import {useEffect, useState, useCallback} from 'react';
import {ArrowLeft, Check, Plus, Loader2} from 'lucide-react';
import './milestone.css'
import { createMilestone, getMilestone, updateStatus } from '../utils/milestoneUtils';
import { Toaster, toast } from "sonner";

export default function MilestonesPage({ project, onBack }) {
    const [milestones, setMilestones] = useState([]);
    const collaboratorNames = project.collaboratorNames.split(',');
    const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);
    const [selectMilestone, setSelectMilestone] = useState(false);
    const [Timeout, setTimeout] = useState(false);

    // Combine owner and collaborators, then filter out current user
    const allAssignableUsers = [
        { id: project.ownerId, name: project.owner },
        ...project.collaborators.map((id, index) => ({
            id,
            name: collaboratorNames[index]?.trim()
        }))
    ]
    //.filter(user => user.id !== currentUserId);

    const fetchMilestones = useCallback(async (Id) => {
        try {
            const Milestone_data = await getMilestone(Id);

            if (!Array.isArray(Milestone_data)) {
                console.warn('API response is not an array:', Milestone_data);
                return [];
            }
            return Milestone_data.map((milestone) => ({
                id: milestone._id,
                name: milestone.name,
                description: milestone.description,
                dueDate: milestone.dueDate,
                assignedTo: milestone.assignedTo,
                status: milestone.status,
            }));
        }
        catch (error) {
            console.error('Error finding milestones:', error);
            return [];
        }
    }, []);

    const loadMilestones = useCallback(async (Id) => {
        try{
            const milestones = await fetchMilestones(Id);
            setMilestones(milestones);
        }
        catch(error){
            console.error(error);
        }
        finally{
            setIsLoadingMilestones(false);
        }
    }, [fetchMilestones, setMilestones]);

    useEffect(() => {
        const projectId = project.id;
        loadMilestones(projectId);
    }, [loadMilestones, project, project.id]);

    const [newMilestone, setNewMilestone] = useState({
        name: '',
        description: '',
        dueDate: '',
        assignedTo: '',
        status: 'In Progress'
    });

    const [showForm, setShowForm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMilestone(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const API_CALL_CREATE_MILESTONE = async (projectId) => {
        try{
            const Data = {
                projectId,
                ...newMilestone,
            }
            toast.success("Milestone successfully created", {
                style: { backgroundColor: "green", color: "white" },
            });
            return await createMilestone(Data);
        }
        catch(error) {
            console.error('Error creating milestone:', error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTimeout(true);
        try{
            const projectId = project.id;
            await API_CALL_CREATE_MILESTONE(projectId);
            setNewMilestone({
                name: '',
                description: '',
                dueDate: '',
                assignedTo: '',
                projectId: '',
                status: 'Not Started'
            });
            setShowForm(false);
            loadMilestones(projectId);
            setTimeout(false);
        }
        catch(error){
            console.error(error);
        }
    };

    const toggleComplete = async (id, currentStatus) => {        
        setSelectMilestone(true);

        try{
            const newStatus = currentStatus === "Complete" ? "In Progress" : "Complete";
            await changeStatus(id, newStatus);
            loadMilestones(project.id);
        }
        catch(error){
            console.error("Could not select milestone", error);
        }
        finally{
            setSelectMilestone(false);
        }
    };

    // Function to get user name by ID
    const getUserNameById = (userId) => {
        const user = allAssignableUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown';
    };

    const changeStatus = async (id, stat) => {
        try {
            const update = {
                userId: id,
                status: stat
            }
            await updateStatus(update);
        }
        catch(error) {
            console.log('Error updating user:', error);
        }
    }

    return (
        <article className="milestones-page">
            <header className="flex justify-between items-center mb-8">
                <header className="header">
                    <hgroup className="header-title-group">
                        <button className="back-arrow" onClick={onBack}>
                            <ArrowLeft />
                        </button>
                        <h1 className="page-title">Milestones for {project.title}</h1>
                    </hgroup>
                </header>
            </header>

            <section className="milestones-controls">
                <button
                    className="add-milestone-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={18} className="mr-2" />
                    {showForm ? 'Cancel' : 'Add Milestone'}
                </button>
            </section>

            {showForm && (
                <form onSubmit={handleSubmit} className="milestone-form">
                    <section className="form-group">
                        <label htmlFor="name">Milestone Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newMilestone.name}
                            onChange={handleChange}
                            required
                        />
                    </section>

                    <section className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={newMilestone.description}
                            onChange={handleChange}
                            rows={3}
                            required
                        />
                    </section>

                    <article className="form-row">
                        <section className="form-group">
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={newMilestone.dueDate}
                                onChange={handleChange}
                                required
                            />
                        </section>
                        <section className="form-group">
                            <label htmlFor="assignedTo">Assigned To</label>
                            <select
                                id="assignedTo"
                                name="assignedTo"
                                value={newMilestone.assignedTo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a collaborator</option>
                                {allAssignableUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </section>
                    </article>

                    {/*<section className="form-group">*/}
                    {/*    <label htmlFor="status">Status</label>*/}
                    {/*    <select*/}
                    {/*        id="status"*/}
                    {/*        name="status"*/}
                    {/*        value={newMilestone.status}*/}
                    {/*        onChange={handleChange}*/}
                    {/*    >*/}
                    {/*        <option value="Not Started">Not Started</option>*/}
                    {/*        <option value="In Progress">In Progress</option>*/}
                    {/*        <option value="Blocked">Blocked</option>*/}
                    {/*    </select>*/}
                    {/*</section>*/}

                    <menu className="form-actions">
                        <li>
                            <button type="submit" className="submit-button" disabled={Timeout}>
                                <Check size={18} className="mr-2" />
                                Add Milestone
                            </button>
                        </li>
                    </menu>
                </form>
            )}

            <section className="milestones-list">
                {isLoadingMilestones ? ( 
                    <figure className="loading-milestones" role="status" aria-busy="true">
                        <svg 
                            className="loading-spinner" 
                            viewBox="0 0 50 50" 
                            aria-hidden="true"
                            focusable="false"
                        >
                            <circle 
                                cx="25" 
                                cy="25" 
                                r="20" 
                                fill="none" 
                                stroke="currentColor"
                                strokeWidth="5"
                                strokeLinecap="round"
                            />
                        </svg>
                        <figcaption className="visually-hidden" style={{ color: 'black' }}>Loading milestones...</figcaption>
                    </figure>
                ): milestones.length === 0 ? (
                    <p className="no-milestones">No milestones yet. Add your first milestone!</p>
                ) : (
                    <ul>
                        {milestones.map(milestone => (
                            <li key={milestone.id} className={`milestone-card ${milestone.status === "Complete" ? 'completed' : ''}`}>
                                <header className="milestone-header">
                                    <h2 className="milestone-title">
                                        <button
                                            className="status-toggle"
                                            onClick={() => toggleComplete(milestone.id, milestone.status)}
                                            disabled={selectMilestone}
                                        >
                                        {selectMilestone ? (
                                            <Loader2 size={16} className="animate-spin" /> 
                                        ) :
                                        (milestone.status === "Complete" ? <Check size={20} /> : <strong className="checkbox" />)}
                                        </button>
                                        {milestone.name}
                                    </h2>
                                    <p className="milestone-status">{milestone.status}</p>
                                </header>
                                <p className="milestone-description">{milestone.description}</p>
                                <dl className="milestone-meta">
                                    <dt>Due Date:</dt>
                                    <dd>{milestone.dueDate}</dd>
                                    <dt>Assigned To:</dt>
                                    <dd>{getUserNameById(milestone.assignedTo)}</dd>
                                </dl>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <Toaster position="bottom-right" />
        </article>
    );
}