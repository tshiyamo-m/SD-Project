import {useEffect, useState} from 'react';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import './milestone.css'

export default function MilestonesPage({ project, onBack }) {
    const [milestones, setMilestones] = useState([]);

    useEffect(() => {

        const Id = project.id;
        console.log(project);
        //const fullName = localStorage.getItem('fullName');
        const fetchMilestones = async () => {

            try{
                const response = await fetch('/api/milestones/getMilestone', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: Id,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to find milestones!');
                }
                const Milestone_data = await response.json();

                if (!Array.isArray(Milestone_data)) {
                    console.warn('API response is not an array:', Milestone_data);
                    return [];
                }
                //map data since we are making an async call
                return Milestone_data.map((milestone, index) => ({
                    id: milestone.id,
                    name: milestone.name,
                    description: milestone.description,
                    dueDate: milestone.dueDate,
                    assignedTo: milestone.assignedTo,
                    status: milestone.status,
                }));


            }
            catch(error) {
                console.error('Error finding milestones:', error);
                console.log("hello sir");
                return [];
            }
        }

        const loadMilestones = async () => {
            const milestones = await fetchMilestones();
            setMilestones(milestones);
        };

        loadMilestones();



    }, [project, project.id]);

    const [newMilestone, setNewMilestone] = useState({
        name: '',
        description: '',
        dueDate: '',
        assignedTo: '',
        status: 'Not Started'
    });

    const [showForm, setShowForm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMilestone(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        //setMilestones([...milestones, milestone]);
        const Mongo_id = project.id;

        const API_CALL_CREATE_MILESTONE = async () => {
            try{
                const response = await fetch('/api/milestones/createMilestone', {
                    method: 'POST',
                    body: JSON.stringify({
                        projectId: Mongo_id,
                        ...newMilestone,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error('Failed to create milestone');
                }
                else{
                    //setMilestone_id(result._id);
                    return result._id;
                }
            }
            catch(error) {
                console.error('Error creating milestone:', error);
            }
        }

        await API_CALL_CREATE_MILESTONE();

        setNewMilestone({
            name: '',
            description: '',
            dueDate: '',
            assignedTo: '',
            projectId: '',
            status: 'Not Started'
        });
        //setMilestones([...milestones, newMilestone])
        setShowForm(false);
    };

    const toggleComplete = (id) => {
        setMilestones(milestones.map(milestone =>
            milestone.id === id
                ? { ...milestone, completed: !milestone.completed }
                : milestone
        ));
    };

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
                            <input
                                type="text"
                                id="assignedTo"
                                name="assignedTo"
                                value={newMilestone.assignedTo}
                                onChange={handleChange}
                                required
                            />
                        </section>
                    </article>

                    <section className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={newMilestone.status}
                            onChange={handleChange}
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Blocked">Blocked</option>
                        </select>
                    </section>

                    <menu className="form-actions">
                        <li>
                            <button type="submit" className="submit-button">
                                <Check size={18} className="mr-2" />
                                Add Milestone
                            </button>
                        </li>
                    </menu>
                </form>
            )}

            <section className="milestones-list">
                {milestones.length === 0 ? (
                    <p className="no-milestones">No milestones yet. Add your first milestone!</p>
                ) : (
                    <ul>
                        {milestones.map(milestone => (
                            <li key={milestone.id} className={`milestone-card ${milestone.completed ? 'completed' : ''}`}>
                                <header className="milestone-header">
                                    <h2 className="milestone-title">
                                        <button
                                            className="status-toggle"
                                            onClick={() => toggleComplete(milestone.id)}
                                        >
                                            {milestone.completed ? <Check size={20} /> : <span className="checkbox" />}
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
                                    <dd>{milestone.assignedTo}</dd>
                                </dl>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </article>
    );
}