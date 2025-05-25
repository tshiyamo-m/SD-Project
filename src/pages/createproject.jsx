import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import './createproject.css'
import { createProject,addProject } from '../utils/projectUtils';
import { Toaster, toast } from "sonner";

export default function CreateProjectPage({ onBack, onCreateProject }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        field: '',
        collaborators: [],
        requirements: '',
        fundingAmount: '',
        fundingSource: '',
        startDate: '',
        endDate: '',
        status: 'Planning',
        tags: '',
        skills: ''
    });

    //const [newCollaborator, setNewCollaborator] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleAddCollaborator = () => {
    //     if (newCollaborator.trim() && !formData.collaborators.includes(newCollaborator)) {
    //         setFormData(prev => ({
    //             ...prev,
    //             collaborators: [...prev.collaborators, newCollaborator.trim()]
    //         }));
    //         setNewCollaborator('');
    //     }
    // };

    // const handleRemoveCollaborator = (collaborator) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         collaborators: prev.collaborators.filter(c => c !== collaborator)
    //     }));
    // };
    const fullName = localStorage.getItem('fullName');
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            toast.error("End date cannot be before start date", {
                style: { backgroundColor: "red", color: "white" },
            });
            return;
        }

        const project = {
            ...formData,
            id: Date.now(),
            owner: fullName,
            created: new Date().toISOString().split('T')[0],
            updated: new Date().toISOString().split('T')[0],
            tags: formData.tags.split(',').map(tag => tag.trim()),
            skills: formData.skills.split(',').map(skill => skill.trim()),
            Documents: []
        };

        //API CALL TO SUBMIT PROJECT INTO DB

        const Mongo_id = localStorage.getItem('Mongo_id');

        const Project_Data = {
            owner: Mongo_id,
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()),
            skills: formData.skills.split(',').map(skill => skill.trim())
        }

        try{

            const newProjectId = await createProject(Project_Data);  //returns project Mongo ID
            
            const Data = {
                user_id: Mongo_id,
                project_id: newProjectId 
            }

            await addProject(Data);

            onCreateProject(project);

            
            toast.success("Project created", {
                    style: { backgroundColor: "green", color: "white" },
                });


            onBack();


        }
        catch(error){

            toast.error("Could not create project", {
                style: { backgroundColor: "red", color: "white" },
            });

            console.error("Could Not Create Project on create project page")
        }
    };

    return (
        <article className="project-page-content">
            <header className="flex justify-between items-center mb-8">
                <header className="header">
                    <hgroup className="header-title-group">
                        <figure className="back-arrow" onClick={onBack}>
                            <ArrowLeft />
                        </figure>
                        <h1 className="page-title">Create New Project</h1>
                    </hgroup>
                </header>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="form-group">
                    <label htmlFor="title">Project Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </section>

                <section className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        required
                    />
                </section>

                <section className="form-group">
                    <label htmlFor="field">Field/Category</label>
                    <input
                        type="text"
                        id="field"
                        name="field"
                        value={formData.field}
                        onChange={handleChange}
                        required
                    />
                </section>

                <section className="form-group">
                    <label htmlFor="requirements">High-Level Project Requirements</label>
                    <input
                        type="text"
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="e.g. Functional/Non-Functional Requirements of System"
                    />
                </section>

                {/*<section className="form-group">*/}
                {/*    <label>Collaborators</label>*/}
                {/*    <article className="collaborator-input">*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            value={newCollaborator}*/}
                {/*            onChange={(e) => setNewCollaborator(e.target.value)}*/}
                {/*            placeholder="Add collaborator email"*/}
                {/*        />*/}
                {/*        <button*/}
                {/*            type="button"*/}
                {/*            onClick={handleAddCollaborator}*/}
                {/*            className="add-button"*/}
                {/*        >*/}
                {/*            Add*/}
                {/*        </button>*/}
                {/*    </article>*/}
                {/*    {formData.collaborators.length > 0 && (*/}
                {/*        <ul className="collaborator-list">*/}
                {/*            {formData.collaborators.map(collab => (*/}
                {/*                <li key={collab}>*/}
                {/*                    {collab}*/}
                {/*                    <button*/}
                {/*                        type="button"*/}
                {/*                        onClick={() => handleRemoveCollaborator(collab)}*/}
                {/*                        className="remove-button"*/}
                {/*                    >*/}
                {/*                        <X size={16} />*/}
                {/*                    </button>*/}
                {/*                </li>*/}
                {/*            ))}*/}
                {/*        </ul>*/}
                {/*    )}*/}
                {/*</section>*/}

                <article className="form-row">
                    <section className="form-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                    </section>
                    <section className="form-group">
                        <label htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                    </section>
                </article>

                {/*<article className="form-row">*/}
                {/*    <section className="form-group">*/}
                {/*        <label htmlFor="fundingAmount">Funding Amount</label>*/}
                {/*        <input*/}
                {/*            type="number"*/}
                {/*            id="fundingAmount"*/}
                {/*            name="fundingAmount"*/}
                {/*            value={formData.fundingAmount}*/}
                {/*            onChange={handleChange}*/}
                {/*            placeholder="R"*/}
                {/*        />*/}
                {/*    </section>*/}
                {/*    <section className="form-group">*/}
                {/*        <label htmlFor="fundingSource">Funding Source</label>*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            id="fundingSource"*/}
                {/*            name="fundingSource"*/}
                {/*            value={formData.fundingSource}*/}
                {/*            onChange={handleChange}*/}
                {/*            placeholder="e.g., University Grant, NSF"*/}
                {/*        />*/}
                {/*    </section>*/}
                {/*</article>*/}

                <section className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                    </select>
                </section>

                <section className="form-group">
                    <label htmlFor="tags">Tags (comma separated)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g., AI, Healthcare, Urgent"
                    />
                </section>

                <section className="form-group">
                    <label htmlFor="skills">Required Skills (comma separated)</label>
                    <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g., Python, Data Analysis, Machine Learning"
                    />
                </section>

                <menu className="form-actions">
                    <li>
                        <button type="button" onClick={onBack} className="cancel-button">
                            Cancel
                        </button>
                    </li>
                    <li>
                        <button type="submit" className="submit-button">
                            <Check size={18} className="mr-2"/>
                            Create Project
                        </button>
                    </li>
                </menu>
            </form>
            <Toaster position="bottom-right" />       
        </article>
        
    );
}