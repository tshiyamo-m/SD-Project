import { useState } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft, Upload, FileText, Download, Trash2 } from 'lucide-react';
import './projects.css';

const ViewProjectPage = ({ project, onBack }) => {
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: "Project Proposal",
            type: "PDF",
            uploadedBy: "Dr. Jane Doe",
            uploadDate: "2025-03-12",
            size: "2.4 MB"
        },
        {
            id: 2,
            name: "Initial Research Findings",
            type: "DOCX",
            uploadedBy: "John Smith",
            uploadDate: "2025-03-28",
            size: "4.1 MB"
        }
    ]);

    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newDocument, setNewDocument] = useState({
        name: "",
        file: null
    });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDocument({
                ...newDocument,
                file: file,
                name: file.name
            });
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (newDocument.file) {
            const uploadedDoc = {
                id: documents.length + 1,
                name: newDocument.name,
                type: newDocument.file.name.split('.').pop().toUpperCase(),
                uploadedBy: "Monare", // Current user
                uploadDate: new Date().toISOString().split('T')[0],
                size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`
            };

            setDocuments([...documents, uploadedDoc]);
            setShowUploadForm(false);
            setNewDocument({ name: "", file: null });
        }
    };

    const handleDeleteDocument = (docId) => {
        setDocuments(documents.filter(doc => doc.id !== docId));
    };

    return (
        <article className="project-page-content">
            <header className="flex justify-between items-center mb-8">
                <header className="header">
                    <hgroup className="header-title-group">
                        <figure className="back-arrow" onClick={onBack}>
                            <ArrowLeft />
                        </figure>
                        <h1 className="page-title">{project.title}</h1>
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

            <section className="project-details">
                <article className="project-card project-full-view">
                    <header className="project-header">
                        <h2 className="project-title">{project.title}</h2>
                        <p className="project-status">{project.status}</p>
                    </header>

                    <p className="project-description">{project.description}</p>

                    <section className="project-metadata">
                        <dl className="project-meta">
                            <dt>Owner:</dt>
                            <dd>{project.owner}</dd>
                        </dl>

                        <dl className="project-meta">
                            <dt>Field:</dt>
                            <dd>{project.field}</dd>
                        </dl>

                        <dl className="project-meta">
                            <dt>Created:</dt>
                            <dd>{project.created}</dd>

                            <dt>Last updated:</dt>
                            <dd>{project.updated}</dd>
                        </dl>

                        <dl className="project-meta">
                            <dt>Collaborators:</dt>
                            <dd>{project.collaborators.join(", ")}</dd>
                        </dl>

                        <dl className="project-meta">
                            <dt>Required skills:</dt>
                            <dd>{project.skills.join(", ")}</dd>
                        </dl>

                        <dl className="project-meta">
                            <dt>Tags:</dt>
                            <dd>{project.tags.join(", ")}</dd>
                        </dl>
                    </section>
                </article>
            </section>

            <section className="documents-section">
                <header className="section-header">
                    <h2 className="section-title">Project Documents</h2>
                    <button
                        className="upload-button"
                        onClick={() => setShowUploadForm(true)}
                    >
                        <Upload size={16} />
                        <span>Upload Document</span>
                    </button>
                </header>

                {showUploadForm && (
                    <form className="upload-form" onSubmit={handleUpload}>
                        <fieldset className="form-group">
                            <legend>Upload New Document</legend>

                            <label htmlFor="document-file" className="file-input-label">
                                <input
                                    type="file"
                                    id="document-file"
                                    onChange={handleFileSelect}
                                    required
                                />
                                <span className="file-input-text">
                                    {newDocument.file ? newDocument.file.name : 'Choose a file'}
                                </span>
                            </label>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowUploadForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={!newDocument.file}
                                >
                                    Upload
                                </button>
                            </div>
                        </fieldset>
                    </form>
                )}

                {documents.length > 0 ? (
                    <table className="documents-table">
                        <thead>
                        <tr>
                            <th>Document</th>
                            <th>Type</th>
                            <th>Uploaded By</th>
                            <th>Date</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td>
                                    <div className="document-name">
                                        <FileText size={16} />
                                        <span>{doc.name}</span>
                                    </div>
                                </td>
                                <td>{doc.type}</td>
                                <td>{doc.uploadedBy}</td>
                                <td>{doc.uploadDate}</td>
                                <td>{doc.size}</td>
                                <td>
                                    <div className="document-actions">
                                        <button className="action-button download-button">
                                            <Download size={16} />
                                        </button>
                                        <button
                                            className="action-button delete-button"
                                            onClick={() => handleDeleteDocument(doc.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-documents-message">No documents have been uploaded for this project.</p>
                )}
            </section>
        </article>
    );
};

export default ViewProjectPage;