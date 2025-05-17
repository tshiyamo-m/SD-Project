import { useState, useEffect } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft, Upload, FileText, Download, Trash2, Save, Edit, X, ChevronDown, Check } from 'lucide-react';
import './projects.css';
import './viewproject.css';
import { jwtDecode } from "jwt-decode";
import { getAllUsers,getUser } from '../utils/loginUtils';
import { updateProject } from '../utils/projectUtils';
import { fetchFiles, uploadFiles, deleteFile, downloadFile } from '../utils/bucketUtils';
import { toast } from "sonner";

const ViewProjectPage = ({ project: initialProject, onBack }) => {
    // State for project data with edit mode
    const [project, setProject] = useState(initialProject);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({...initialProject});
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [reviewerNames, setReviewerNames] = useState({});
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    //const [isLoadingNames, setIsLoadingNames] = useState(false);

    const projectId = initialProject.id;
    const fullName = localStorage.getItem('fullName');
    const loggedInUserId = localStorage.getItem('Mongo_id');
    const projectOwnerId = initialProject.ownerId;

    // Document state management
    const [documents, setDocuments] = useState([]);

    // Pre-fetch and store collaborator names
    useEffect(() => {
        const fetchCollaboratorNames = async () => {
            //setIsLoadingNames(true);
            try {
                const namesObj = {};
                for (const collabId of initialProject.collaborators) {
                    if (!reviewerNames[collabId]) {
                        const user = await getuser(collabId);
                        if (user) {
                            namesObj[collabId] = user.name;
                        } else {
                            namesObj[collabId] = "Unknown Reviewer";
                        }
                    }
                }

                setReviewerNames(prev => ({
                    ...prev,
                    ...namesObj
                }));
            } catch (error) {
                console.error('Error fetching collaborator names:', error);
            } finally {
                //setIsLoadingNames(false);
            }
        };

        if (initialProject.collaborators.length > 0) {
            fetchCollaboratorNames();
        }
    }, [initialProject.collaborators]);

    // Fetch all users when component mounts
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {

                const data = await getAllUsers();

                // Process users to decode tokens
                const processedUsers = data.map(user => {
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

                setAllUsers(processedUsers);
                setFilteredUsers(processedUsers.filter(user =>
                    !initialProject.collaborators.includes(user._id) &&
                    !user.isAdmin &&
                    user._id !== loggedInUserId &&
                    user._id !== projectOwnerId
                ));

            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search term
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredUsers(allUsers.filter(user =>
                !editData.collaborators.includes(user._id) &&
                !user.isAdmin &&
                user._id !== loggedInUserId &&
                user._id !== projectOwnerId
            ));
        } else {
            const filtered = allUsers.filter(user =>
                (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                !editData.collaborators.includes(user._id) &&
                !user.isAdmin &&
                user._id !== loggedInUserId &&
                user._id !== projectOwnerId
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, allUsers, editData.collaborators, loggedInUserId, projectOwnerId]);

    // Get user data - modified to be non-async in rendering context
    const getuser = async (findId) => {
        try {
            const uD = await getUser(findId);
            const decoded = jwtDecode(uD.token);
            return {
                name: decoded.name || '',
                isReviewer: uD.isReviewer,
                token: uD.token,
            };
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    };

    // Display reviewer name from cache instead of async call
    const displayReviewerName = (reviewerId) => {
        return reviewerNames[reviewerId] || "Loading...";
    };

    // Add collaborator to project
    const addCollaborator = (userId) => {
        if (!editData.collaborators.includes(userId)) {
            setEditData(prev => ({
                ...prev,
                collaborators: [...prev.collaborators, userId]
            }));

            // Find the user in allUsers to get their name
            const user = allUsers.find(u => u._id === userId);
            if (user && user.name) {
                setReviewerNames(prev => ({
                    ...prev,
                    [userId]: user.name
                }));
            }
        }
        setSearchTerm('');
        setShowUserDropdown(false);
    };

    // Remove collaborator from project
    const removeCollaborator = (userId) => {
        setEditData(prev => ({
            ...prev,
            collaborators: prev.collaborators.filter(id => id !== userId)
        }));
    };

    //Load personal docs from DB
    useEffect(() => {
        let isMounted = true;
        const loadDocuments = async () => {
            setIsLoadingDocuments(true);
            try {
                const fetchedDocuments = await fetchFiles(initialProject.id);

                if (!fetchedDocuments){
                    throw new Error;
                }
                setDocuments(fetchedDocuments);
            } catch (error) {
                console.error('Failed to load documents:', error);
                if (isMounted) toast.error("Could not load documents", {
                        style: { backgroundColor: "red", color: "white" },
                        });
            }
            finally {
                setIsLoadingDocuments(false);  // End loading
            }
        };

        if (initialProject.id) {

            loadDocuments();
            return () => { isMounted = false; };

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

    // Handle document upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (newDocument.file) {
            setIsLoadingDocuments(true); 
           
            const uploadedDoc = {
                id: documents.length + 1,
                name: newDocument.name,
                type: newDocument.file.name.split('.').pop().toUpperCase(),
                uploadedBy: fullName,
                uploadDate: new Date().toISOString().split('T')[0],
                size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`
            };

            const formData = new FormData();
            formData.append('file', newDocument.file);
            formData.append('ProjectID', projectId);
            formData.append('uploadedBy', uploadedDoc.uploadedBy);

            try{
                await uploadFiles(formData);

            }
            catch(error){
                
                console.error(error);

            }

            // Refresh documents list after upload
            const fetchedDocuments = await fetchFiles(projectId);
            setDocuments(fetchedDocuments);

            setIsLoadingDocuments(false); 

            setShowUploadForm(false);
            setNewDocument({ name: "", file: null });
        }
    };

    // Handle document deletion
    const handleDeleteDocument = async (docId) => {
        const strDocId = docId.toString();

        await deleteFile(strDocId);

        // Update UI after successful deletion
        setDocuments(documents.filter(doc => doc.id !== docId));
        console.log('File deleted successfully');
    };

    const handleDownloadDocument = async (docId, docName) => {
        const strDocId = docId.toString();

        await downloadFile(strDocId,docName);

    };

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
    const saveProjectChanges = async () => {
        const Mongo_id = localStorage.getItem("Mongo_id");
        const Updated_Project = {...editData, owner: Mongo_id, updated: new Date().toISOString().split('T')[0]};
        setProject({...editData, updated: new Date().toISOString().split('T')[0]});
        setIsEditing(false);

        const Data = {
            updates: Updated_Project,
            projectId: projectId
        }
        await updateProject(Data);
    };

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
                                    <strong>Edit</strong>
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
                                    <dd>
                                        {project.collaborators.map((collabId, index) => (
                                            <strong key={collabId}>
                                                {displayReviewerName(collabId)}
                                                {index < project.collaborators.length - 1 ? ', ' : ''}
                                            </strong>
                                        ))}
                                    </dd>
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
                                        readOnly  // Add this attribute
                                        className="read-only-input"  // Optional: add a class for styling
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
                                    Collaborators:
                                    <section className="collaborator-input-container">
                                        <section className="selected-collaborators">
                                            {editData.collaborators.map(collabId => (
                                                <strong key={collabId} className="collaborator-tag">
                                                    {displayReviewerName(collabId)}
                                                    <button
                                                        type="button"
                                                        className="remove-collaborator"
                                                        onClick={() => removeCollaborator(collabId)}
                                                    >
                                                        <X size={12}/>
                                                    </button>
                                                </strong>
                                            ))}
                                        </section>
                                        <section className="user-dropdown-container">
                                            <button
                                                type="button"
                                                className="dropdown-toggle"
                                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                            >
                                                <strong>Add collaborator</strong>
                                                <ChevronDown size={16}/>
                                            </button>
                                            {showUserDropdown && (
                                                <section className="user-dropdown">
                                                    <section className="dropdown-search">
                                                        <Search size={16}/>
                                                        <input
                                                            type="text"
                                                            placeholder="Search users..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </section>
                                                    <section className="dropdown-list">
                                                        {filteredUsers.length > 0 ? (
                                                            filteredUsers.map(user => (
                                                                <button
                                                                    type="button"
                                                                    key={user._id}
                                                                    className="user-option"
                                                                    onClick={() => addCollaborator(user._id)}
                                                                >
                                                                    <section className="user-info">
                                                                        <strong>{user.name}</strong>
                                                                        <p>{user.email}</p>
                                                                    </section>
                                                                    {editData.collaborators.includes(user._id) && (
                                                                        <Check size={16} className="selected-icon"/>
                                                                    )}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <p className="no-results">No users found</p>
                                                        )}
                                                    </section>
                                                </section>
                                            )}
                                        </section>
                                    </section>
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
                                        <strong>Cancel</strong>
                                    </button>
                                    <button
                                        type="button"
                                        className="save-button"
                                        onClick={saveProjectChanges}
                                    >
                                        <Save size={16} />
                                        <strong>Save Changes</strong>
                                    </button>
                                </section>
                            </fieldset>
                        )}
                    </section>
                </article>
            </section>

            <section className="documents-section" >
                <header className="section-header">
                    <h2 className="section-title">Project Documents</h2>
                    <button
                        className="upload-button"
                        onClick={() => setShowUploadForm(true)}
                    >
                        <Upload size={16} />
                        <strong>Upload Document</strong>
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

                {isLoadingDocuments ? (
                    <figure className="loading-documents" role="status" aria-busy="true">
                        <svg className="loading-spinner" viewBox="0 0 50 50" aria-hidden="true">
                            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                        <figcaption>Loading documents...</figcaption>
                    </figure>                

                ) : documents.length > 0 ? (
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
                                                onClick={() => handleDownloadDocument(doc.id, doc.name)}
                                            >
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