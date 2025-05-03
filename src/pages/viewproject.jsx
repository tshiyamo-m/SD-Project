import { useState,useEffect } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft, Upload, FileText, Download, Trash2, Save, Edit, X } from 'lucide-react';
import './projects.css';
import './viewproject.css';

const ViewProjectPage = ({ project: initialProject, onBack}) => {
    // State for project data with edit mode
    const [project, setProject] = useState(initialProject);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({...initialProject});
    
    const projectId = initialProject.id;
    const fullName = localStorage.getItem('fullName');
    
    //API CALL TO VIEW DOCUMENTS HERE

    // Document state management
    const [documents, setDocuments] = useState([]);
    

    const fetchFiles = async (ProjectID) => {
        try {


            if (!ProjectID || typeof ProjectID !== 'string') {
                throw new Error('Invalid project ID');
            }
            
            const response = await fetch('/Bucket/retrievedocs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({projectID: ProjectID})
            });
      
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Download failed with status:', response.status, errorData);
                throw new Error('Failed to download file');
            }
      
            const fileData = await response.json();

            if (!(fileData == null)){
                //console.log('Retrieved file:', fileData);

                return fileData.map(file => ({
                    id: file._id.toString(),
                    name: file.filename,
                    type: file.filename.split('.').pop().toUpperCase(),
                    uploadedBy: file.uploadedBy, // You might want to store this in metadata
                    uploadDate: new Date(file.uploadDate).toLocaleDateString(),
                    size: `${(file.length / 1024).toFixed(1)} KB`,
                    metadata: file.metadata // Include all metadata
                }));
            }
            else{
                return [];
            }

        } catch (error) {
          console.error('Error fetching documents:', error);
          throw error;
        }
      };

      useEffect(() => {
        const loadDocuments = async () => {
            
            try {
                const fetchedDocuments = await fetchFiles(initialProject.id);
                setDocuments(fetchedDocuments);
            } catch (err) {
                console.error('Failed to load documents:', err);
                
            } finally {
                
            }
        };

        if (initialProject.id) {
            loadDocuments();
        }
    }, [initialProject.id]);

    // Upload form state
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newDocument, setNewDocument] = useState({
        name: "",
        file: null
    });

    // Handle file selection
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
    //const Mongo_id = localStorage.getItem("Mongo_id")

    // Handle document upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (newDocument.file) {
            const uploadedDoc = {
                id: documents.length + 1,
                name: newDocument.name,
                type: newDocument.file.name.split('.').pop().toUpperCase(),
                uploadedBy: fullName, // Current user
                uploadDate: new Date().toISOString().split('T')[0],
                size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`


            };

            const formData = new FormData();
            formData.append('file', newDocument.file); // 'file' should match the multer field name
            formData.append('ProjectID', projectId); 
            formData.append('uploadedBy', uploadedDoc.uploadedBy)
            
            await fetch('/Bucket/submitdoc', {
              method: 'POST',
              body: formData
            })
            .then(response => response.json())
            .then(data => {
              console.log('Upload successful:', data);
              // Save data.fileId for future reference
            })
            .catch(error => {
              console.error('Upload error:', error); 
            });


            setDocuments([...documents, uploadedDoc]);
            setShowUploadForm(false);
            setNewDocument({ name: "", file: null });

        }
    };
    

    // Handle document deletion
    const handleDeleteDocument = async (docId) => {

        setDocuments(documents.filter(doc => doc.id !== docId));  //delete from UI

        const strDocId = docId.toString();

        try { //Delete from Database
            const response = await fetch('/Bucket/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fileId: strDocId})
            });
            
            if (!response.ok) {
                throw new Error('Failed to download file');
                
            }

            console.log(response.message);
            
        } catch (error) {
            console.error('Download error:', error);
            
        }

    };

    

    const handleDownloadDocument = async (docId, docName) => {
        
        const strDocId = docId.toString();
        try {
            const response = await fetch('/Bucket/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fileId: strDocId})
            });
            
            if (!response.ok) {
                throw new Error('Failed to download file');
                
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
        } catch (error) {
            console.error('Download error:', error);
            
        }
    }

    // Enable edit mode
    const enableEditMode = () => {
        setEditData({...project});
        setIsEditing(true);
    };

    // Cancel edit mode
    const cancelEditMode = () => {
        setIsEditing(false);
    };

    // Save project changes
    const saveProjectChanges = () => {
        const Mongo_id = localStorage.getItem("Mongo_id");
        const Updated_Project =  {...editData, owner: Mongo_id, updated: new Date().toISOString().split('T')[0]}
        setProject({...editData, updated: new Date().toISOString().split('T')[0]});  
        setIsEditing(false);

        const UpdateProject = async () => {

            try{
                const response = await fetch('/api/Projects/updateproject', {
                    method: 'POST',
                    body: JSON.stringify({
                        updates: Updated_Project,
                        projectId: projectId
                    }),
                    headers: {
                        'Content-Type': 'application/json' 
                    }
                });
                if (!response.ok) {
                    console.log("mayne");
                    throw new Error('Failed to update project!');
                }
                

            }
            catch(error) {
                console.log('Error updating project:', error);
            }
        }

        UpdateProject();

        
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value
        });
    };

    // Handle array input changes (tags, skills, collaborators)
    const handleArrayInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value.split(',').map(item => item.trim())
        });
    };

    return (
        <article className="project-page-content">
            <header className="header">
                <hgroup className="header-title-group">
                    <button className="back-arrow" onClick={onBack} aria-label="Go back">
                        <ArrowLeft />
                    </button>
                    <h1 className="page-title">{project.title}</h1>
                </hgroup>
                <nav className="header-menu">
                    <ul>
                        <li>
                            <button className="icon-button" aria-label="Search">
                                <Search size={20} />
                            </button>
                        </li>
                        <li>
                            <button className="icon-button" aria-label="Notifications">
                                <Bell size={20} />
                            </button>
                        </li>
                        <li>
                            <button className="user-button">
                                <figure className="user-icon">
                                    <User size={20} />
                                </figure>
                                <em className="user-name">{fullName}</em> 
                            </button>
                        </li>
                        <li>
                            <button className="menu-button" aria-label="More options">
                                <MoreVertical size={20} />
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>

            <section className="project-details">
                <article className="project-card project-full-view">
                    <header className="project-header">
                        {!isEditing ? (
                            <>
                                <h2 className="project-title">{project.title}</h2>
                                <p className="project-status">{project.status}</p>
                                <button
                                    className="edit-button"
                                    onClick={enableEditMode}
                                    aria-label="Edit project details"
                                >
                                    <Edit size={16} />
                                    <span>Edit</span>
                                </button>
                            </>
                        ) : (
                            <form className="edit-form">
                                <h2>Edit Project Details</h2>
                                <section className="form-header">
                                    <label htmlFor="title">
                                        Title:
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={editData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </label>
                                    <label htmlFor="status">
                                        Status:
                                        <select
                                            id="status"
                                            name="status"
                                            value={editData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Planning">Planning</option>
                                        </select>
                                    </label>
                                </section>
                            </form>
                        )}
                    </header>

                    {!isEditing ? (
                        <p className="project-description">{project.description}</p>
                    ) : (
                        <label htmlFor="description" className="description-label">
                            Description:
                            <textarea
                                id="description"
                                name="description"
                                value={editData.description}
                                onChange={handleInputChange}
                                rows="4"
                            /> 
                        </label>
                    )}

                    <section className="project-metadata">
                        {!isEditing ? (
                            <>
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
                            </>
                        ) : (
                            <fieldset className="edit-metadata">
                                <legend>Project Details</legend>

                                <label htmlFor="owner">
                                    Owner:
                                    <input
                                        type="text"
                                        id="owner"
                                        name="owner"
                                        value={editData.owner}
                                        onChange={handleInputChange}
                                    />
                                </label>

                                <label htmlFor="field">
                                    Field:
                                    <input
                                        type="text"
                                        id="field"
                                        name="field"
                                        value={editData.field}
                                        onChange={handleInputChange}
                                    />
                                </label>

                                <label htmlFor="collaborators">
                                    Collaborators (comma-separated):
                                    <input
                                        type="text"
                                        id="collaborators"
                                        name="collaborators"
                                        value={editData.collaborators.join(", ")}
                                        onChange={handleArrayInputChange}
                                    />
                                </label>

                                <label htmlFor="skills">
                                    Required skills (comma-separated):
                                    <input
                                        type="text"
                                        id="skills"
                                        name="skills"
                                        value={editData.skills.join(", ")}
                                        onChange={handleArrayInputChange}
                                    />
                                </label>

                                <label htmlFor="tags">
                                    Tags (comma-separated):
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        value={editData.tags.join(", ")}
                                        onChange={handleArrayInputChange}
                                    />
                                </label>

                                <section className="edit-actions">
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={cancelEditMode}
                                    >
                                        <X size={16} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="save-button"
                                        onClick={saveProjectChanges}
                                    >
                                        <Save size={16} />
                                        <span>Save Changes</span>
                                    </button>
                                </section>
                            </fieldset>
                        )} 
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
                                <output className="file-input-text">
                                    {newDocument.file ? newDocument.file.name : 'Choose a file'}
                                </output>
                            </label>

                            <section className="form-actions">
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
                            </section>
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
                                    <figure className="document-name">
                                        <FileText size={16} />
                                        <figcaption>{doc.name}</figcaption>
                                    </figure>
                                </td>
                                <td>{doc.type}</td>
                                <td>{doc.uploadedBy}</td>
                                <td>{doc.uploadDate}</td>
                                <td>{doc.size}</td>
                                <td>
                                    <menu className="document-actions">
                                        <li>
                                            <button 
                                                className="action-button download-button" 
                                                aria-label="Download document"
                                                onClick={() => handleDownloadDocument(doc.id, doc.name)}>
                                                <Download size={16} />
                                                
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className="action-button delete-button"
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                aria-label="Delete document"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    </menu>
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