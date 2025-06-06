/* eslint-disable jsx-a11y/anchor-is-valid */
import {useEffect, useState, useCallback} from 'react';
//import { Search, Bell, User, MoreVertical, ArrowLeft, CheckCircle, MessageSquare } from 'lucide-react';
import { MoreVertical, ArrowLeft, CheckCircle, MessageSquare } from 'lucide-react';
import './projects.css'
import './review.css'
//import { useUser } from "../components/UserContext";
import { jwtDecode } from 'jwt-decode';
import { findActiveProject } from '../utils/projectUtils';
import { getUser, updateIsReviewer } from '../utils/loginUtils';
import { getAllReviews, submitReview } from '../utils/reviewUtils';
import { downloadFile, fetchFiles } from '../utils/bucketUtils';
import { toast } from "sonner";

const ReviewerPage = () => {
    // User state
    const userId  = localStorage.getItem('Mongo_id');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [user, setUser] = useState({});
    const [Timeout, setTimeout] = useState(false);

const getAUser = useCallback(async (findId) => {
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
        return {
            name: 'Unknown User',
            isReviewer: 'false',
            token: '',
        }; // More graceful fallback
    }
}, [/*getUser*/]); // Only depends on getUser

const loadUser = useCallback(async (userId) => {
    const userEnter = await getAUser(userId);
    if (userEnter) {
        setUser(userEnter);
        //console.log("User loaded:", userEnter.name);
    }
}, [getAUser, setUser]); 

    useEffect(() => {
        if (!userId) return;
        loadUser(userId);
    }, [userId, loadUser]);

    const [activeTab, setActiveTab] = useState('available');
    const [activeProject, setActiveProject] = useState(null);

    // Projects data
    const [projects, setProjects] = useState([]);
    const [documents, setDocuments] = useState([]);

    const getAllProjects = async () => {
        
        try {
            const userData = await findActiveProject();
            if (!userData){
                throw new Error();
            }
            
            return userData.map((project) => ({
                    _id: project._id,
                    owner: project.owner,
                    title: project.title,
                    description: project.description,
                    field: project.field,
                    collaborators: project.collaborators,
                    requirements: project.requirements,
                    fundingAmount: project.fundingAmount,
                    fundingSource: project.fundingSource,
                    startDate: project.createdAt.split('T')[0],
                    endDate: project.endDate.split('T')[0],
                    tags: project.tags,
                    skills: project.skills,
                    //documents: Array.isArray(project.documents) ? project.documents : []
            }))

        } catch (error) {
            //console.error('Error finding projects:', error);
            return null;
        }
    };


    const retrieveFiles = async (ProjectID) => {
        try {
            return await fetchFiles(ProjectID);

        } catch (error) {
            console.error('Error fetching documents:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!activeProject) return;
        // let isMounted = true;

        const loadDocuments = async () => {
            try {
                const fetchedDocuments = await retrieveFiles(activeProject);
                // if (!isMounted) return;
                if (!fetchedDocuments) {
                    toast.error("Could not load documents", {
                        style: { backgroundColor: "red", color: "white" },
                        });
                    throw new Error();
                }
                setDocuments(fetchedDocuments);
                
            } catch (err) {
                console.error('Failed to load documents:', err);
                setDocuments([]);
            }
        };

        loadDocuments();
        // return () => { isMounted = false; };
    }, [activeProject]);

    useEffect(() => {
        // let isMounted = true;

        const loadProjects = async () => {
            try{
                const userEnter = await getAllProjects();
                if (userEnter) {
                    setProjects(userEnter);
                    //console.log("User loaded:", userEnter.name);
                }
                // if (!isMounted) return;
                if (!userEnter) {                  
                    throw new Error();
                }
                setIsLoadingProjects(false);
                
            }
            catch(error){
                toast.error("Could not load projects", {
                        style: { backgroundColor: "red", color: "white" },
                        });
                console.error(error);
            }
        };

        loadProjects();
        // return () => { isMounted = false; };
    }, [userId]);

    // Reviews data
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

const fetchAllReviews = useCallback(async () => {
    try {
        const Review_data = await getAllReviews();
        
        if (!Review_data) {
            throw new Error('No review data received');
        }

        if (!Array.isArray(Review_data)) {
            console.warn('API response is not an array:', Review_data);
            return [];
        }

        return Review_data.map((review) => ({
            _id: review._id,
            reviewerId: review.reviewerId,
            projectId: review.projectId,
            rating: review.rating,
            comment: review.comment,
            date: review.date,
            type: review.type,
        }));
    } catch (error) {
        console.error('Error finding reviews:', error);
        toast.error("Failed to find reviews", {
            style: { backgroundColor: "red", color: "white" },
        });
        return [];
    }
}, [/*getAllReviews*/]); // Dependency: getAllReviews

    const loadReviews = useCallback(async () => {
        const reviews = await fetchAllReviews();
        setReviews(reviews);
    }, [fetchAllReviews, setReviews]);

    useEffect(() => {
        setIsLoadingReviews(true);
        try{
            loadReviews();
        }
        catch(error){
            console.error(error);
        }
        finally {
            setIsLoadingReviews(false);
        }

    }, [loadReviews]);

    const UpdateProject = async () => {

        try{
            const update = {
                isReviewer: "pending",
                userId: userId
            }
            await updateIsReviewer(update);
        }
        catch(error) {
            console.log('Error updating user:', error);
        }
    }

    const changeReviewStatus = () => {
        //const Mongo_id = localStorage.getItem("Mongo_id");
        UpdateProject();
    }

    // Toggle reviewer status
    // const handleToggleReviewerStatus = () => {
    //     setUser(prevUser => ({
    //         ...prevUser,
    //         isReviewer: "false"
    //     }));
    // };

    // Request to become a reviewer
    const handleRequestReviewer = () => {
        setUser(prevUser => ({
            ...prevUser,
            isReviewer: "pending"
        }));
        changeReviewStatus();
        //alert("Request to become a reviewer has been submitted!");
    };

    const [reviewerNames, setReviewerNames] = useState({});

    // Function to fetch and cache reviewer names
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getReviewerName = async (reviewerId) => {
        // Check if we already have this name cached
        if (reviewerNames[reviewerId]) {
            return reviewerNames[reviewerId];
        }

        // Fetch the user data
        const reviewer = await getAUser(reviewerId);
        if (reviewer) {
            // Update the cache
            setReviewerNames(prev => ({
                ...prev,
                [reviewerId]: reviewer.name
            }));
            return reviewer.name;
        }

        return "Unknown Reviewer";
    };

    useEffect(() => {
        const loadReviewerNames = async () => {
            const uniqueReviewerIds = [...new Set(reviews.map(r => r.reviewerId))];

            for (const reviewerId of uniqueReviewerIds) {
                if (!reviewerNames[reviewerId]) {
                    await getReviewerName(reviewerId);
                }
            }
        };

        if (reviews.length > 0) {
            loadReviewerNames();
        }
    }, [getReviewerName, reviewerNames, reviews]);

    // Search functionality
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = () => {
        if (!searchTerm) return projects;

        return projects.filter(project =>
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        comment: ""
    });

    // Handle review form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReviewForm({
            ...reviewForm,
            [name]: name === 'rating' ? parseInt(value) || 0 : value
        });
    };

    // Submit a review
    const handleReviewSubmit = async (projectId) => {
        setTimeout(true);
        const newReview = {
            //_id: `rev${reviews.length + 1}`,
            rating: reviewForm.rating,
            reviewerId: userId,
            projectId: projectId,
            comment: reviewForm.comment,
            date: new Date().toISOString().split('T')[0],
            type: "reviewer"
        };

        const API_CREATE_REVIEW = async () => {
            try{
                return await submitReview(newReview);
            }
            catch(error) {
                console.error('Error creating review:', error);
            }
            finally{
                setTimeout(false);
            }
        }

        const recId = await API_CREATE_REVIEW();
        const addR = recId.review_model;
        //console.log(recId);
        //console.log("mod", recId.review_model.projectId);

        setReviews([...reviews, addR]);
        setActiveProject(null);
        setReviewForm({ rating: 0, comment: "" });
    };

    const handleDownloadDoc = async (docId, docName) => {

        const stringDocId = docId.toString();
        try {

            downloadFile(stringDocId, docName);

        } catch (error) {
            console.error('Download error:', error);

        }
    }

    // Non-reviewer view
    if (user.isReviewer === "false") {
        return (
            <main className="reviewer-page-content">
                <header className="header">
                    <h1>Research Project Reviews</h1>
                </header>

                <section>
                    <article>
                        <h2>Become a Project Reviewer</h2>
                        <p>You are currently not registered as a project reviewer. Reviewers help evaluate research proposals and contribute to the scientific community.</p>

                        <footer>
                            <button onClick={handleRequestReviewer} aria-label="Request to become a reviewer">
                                <CheckCircle size={20} aria-hidden="true" />
                                Request Reviewer Status
                            </button>
                        </footer>
                    </article>
                </section>
            </main>
        );
    }

    if (user.isReviewer === "pending") {
        return (
            <main className="reviewer-page-content">
                <header className="header">
                    <h1>Research Project Reviews</h1>
                </header>

                <section>
                    <article>
                        <h2>Become a Project Reviewer</h2>
                        <p>You have applied to be a reviewer. An admin should attend to your request in due time.</p>
                    </article>
                </section>
            </main>
        );
    }

    // If viewing a specific project
    if (activeProject) {
        const project = projects.find(p => p._id === activeProject);
        const projectReviews = reviews.filter(r => r.projectId === activeProject);

        return (
            <main className="reviewer-page-content">
                <header>
                    <hgroup>
                        <button onClick={() => {
                            setActiveProject(null);
                            setDocuments([]);
                        }}>
                            <ArrowLeft aria-hidden="true"/>
                            <span className="sr-only">Back to projects</span>
                        </button>
                        <h1>Review Project</h1>
                    </hgroup>
                </header>

                <section>
                    <article>
                        <header>
                            <h2>{project.title}</h2>
                        </header>
                        <p>{project.description}</p>

                        <dl>
                            <dt>Owner</dt>
                            <dd>{project.owner}</dd>

                            <dt>Field</dt>
                            <dd>{project.field}</dd>

                            <dt>Requirements</dt>
                            <dd>{project.requirements}</dd>

                            {/*<dt>Funding Amount</dt>*/}
                            {/*<dd>${project.fundingAmount}</dd>*/}

                            {/*<dt>Funding Source</dt>*/}
                            {/*<dd>{project.fundingSource}</dd>*/}

                            <dt>Start Date</dt>
                            <dd>{project.startDate}</dd>

                            <dt>End Date</dt>
                            <dd>{project.endDate}</dd>

                            <dt>Tags</dt>
                            <dd>{project.tags.join(", ")}</dd>

                            <dt>Required Skills</dt>
                            <dd>{project.skills.join(", ")}</dd>

                            <dt>Documents</dt>
                            <dd>
                                <ul>
                                    {documents.length > 0 ? (
                                        documents.map((doc, index) => (
                                            <li key={index}>
                                                <a
                                                    //href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDownloadDoc(doc.id, doc.name);
                                                    }}
                                                    style={{ color: 'blue', textDecoration: 'underline' }}
                                                >
                                                    {doc.name}
                                                </a>
                                                <span> ({doc.type}, {doc.size})</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li>No documents available.</li>
                                    )}
                                </ul>
                            </dd>
                        </dl>
                    </article>

                    {projectReviews.length > 0 && (
                        <section>
                            <h3>Previous Reviews</h3>
                    { isLoadingReviews ? (
                        <figure className="loading-projects" role="status" aria-busy="true">
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
                        <figcaption className="visually-hidden">Loading projects...</figcaption>
                        </figure>
                    ) :projectReviews.map(review => (
                                <article key={review._id}>
                                    <header>
                                        <h4>Review by {reviewerNames[review.reviewerId] || "Loading..."}</h4>
                                        <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                    </header>
                                    <blockquote>{review.comment}</blockquote>
                                    <footer>
                                        <time dateTime={review.date}>{review.date}</time>
                                    </footer>
                                </article>
                            ))}
                        </section>
                    )}

                    <form>
                        <fieldset>
                            <legend>Submit Your Review</legend>

                            <label htmlFor="rating">Rating (1-5 stars)</label>
                            <select
                                id="rating"
                                name="rating"
                                value={reviewForm.rating}
                                onChange={handleInputChange}
                            >
                                <option value="0">Select rating</option>
                                <option value="1">1 ★</option>
                                <option value="2">2 ★★</option>
                                <option value="3">3 ★★★</option>
                                <option value="4">4 ★★★★</option>
                                <option value="5">5 ★★★★★</option>
                            </select>

                            <label htmlFor="comment">Comments</label>
                            <textarea
                                id="comment"
                                name="comment"
                                value={reviewForm.comment}
                                onChange={handleInputChange}
                                placeholder="Enter your review comments here..."
                                rows="5"
                            ></textarea>
                        </fieldset>

                        <footer>
                            <button type="button" onClick={() => handleReviewSubmit(project._id)}  disabled={Timeout}>
                                Submit Review
                            </button>
                        </footer>
                    </form>
                </section>
            </main>
        );
    }

    // Main reviewer view with tabs
    return (
        <main className="reviewer-page-content">
            <header>
                <h1>Research Project Reviews</h1>
                <nav>
                    <ul>
                        <li>
                            <form role="search" onSubmit={e => e.preventDefault()}>
                                <label htmlFor="search">Search projects</label>
                                <input
                                    type="search"
                                    id="search"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </form>
                        </li>
                        <li>
                            <button aria-label="More options">
                                <MoreVertical size={20} aria-hidden="true" />
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>

            <nav>
                <ul role="tablist">
                    <li role="presentation">
                        <button
                            role="tab"
                            aria-selected={activeTab === 'available'}
                            onClick={() => setActiveTab('available')}
                        >
                            Available Projects
                        </button>
                    </li>
                    <li role="presentation">
                        <button
                            role="tab"
                            aria-selected={activeTab === 'completed'}
                            onClick={() => setActiveTab('completed')}
                        >
                            My Completed Reviews
                        </button>
                    </li>
                </ul>
            </nav>

            <section aria-labelledby="available-tab" hidden={activeTab !== 'available'}>
                {isLoadingProjects ? (
                    <figure className="loading-projects" role="status" aria-busy="true">
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
                    <figcaption className="visually-hidden">Loading projects...</figcaption>
                    </figure>
                ) : filteredProjects().length === 0 ? (
                    <p>No available projects match your search.</p>
                ) : (
                    filteredProjects().map(project => (
                        <article key={project._id}>
                            <header>
                                <h2>{project.title}</h2>
                            </header>
                            <p>{project.description}</p>
                            <dl>
                                <dt>Field</dt>
                                <dd>{project.field}</dd>

                                <dt>Requirements</dt>
                                <dd>{project.requirements}</dd>

                                <dt>Start Date</dt>
                                <dd>{project.startDate}</dd>

                                <dt>End Date</dt>
                                <dd>{project.endDate}</dd>
                            </dl>
                            <footer>
                                <button onClick={() => setActiveProject(project._id)}>
                                    <MessageSquare size={16} aria-hidden="true" />
                                    View Project
                                </button>
                            </footer>
                        </article>
                    ))
                )}
            </section>

            <section aria-labelledby="completed-tab" hidden={activeTab !== 'completed'}>
                {reviews.filter(r => r.reviewerId === userId).length === 0 ? (
                    <p>No completed reviews match your search.</p>
                ) : (
                    reviews.filter(r => r.reviewerId === userId).map(review => {
                        // console.log("Projects:", projects);
                        // console.log("Review:", review);
                        // console.log("Looking for project with ID:", review.projectId);
                        const project = projects.find(p => String(p._id) === String(review.projectId));
                        // console.log("review", review);
                        // console.log("project", project);
                        return (
                            <article key={review._id}>
                                <header>
                                    <h2>{project?.title || "Unknown Project"}</h2>
                                    <p>Your Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                </header>
                                <blockquote>{review.comment}</blockquote>
                                <footer>
                                    <button onClick={() => setActiveProject(review.projectId)}>
                                        <MessageSquare size={16} aria-hidden="true" />
                                        View Details
                                    </button>
                                </footer>
                            </article>
                        );
                    })
                )}
            </section>
        </main>
    );
};

export default ReviewerPage;
