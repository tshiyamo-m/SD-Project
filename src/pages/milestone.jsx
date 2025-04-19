import { useState } from 'react';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import './milestone.css'

export default function MilestonesPage({ project, onBack }) {
    const [milestones, setMilestones] = useState([
        {
            id: 1,
            name: "Literature Review",
            description: "Complete review of existing research papers",
            dueDate: "2025-05-15",
            status: "In Progress",
            assignedTo: "Alice Lee",
            completed: false
        },
        {
            id: 2,
            name: "Prototype Development",
            description: "Build initial prototype with core features",
            dueDate: "2025-06-30",
            status: "Not Started",
            assignedTo: "John Smith",
            completed: false
        }
    ]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const milestone = {
            ...newMilestone,
            id: Date.now(),
            completed: false
        };
        setMilestones([...milestones, milestone]);
        setNewMilestone({
            name: '',
            description: '',
            dueDate: '',
            assignedTo: '',
            status: 'Not Started'
        });
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