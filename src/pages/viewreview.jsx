import {useEffect, useState} from 'react';
import { ArrowLeft, Star, StarOff, Send, XCircle, UserCircle, Calendar } from 'lucide-react';
import './projects.css';
import './viewreview.css';
import {jwtDecode} from "jwt-decode";
import { submitReview } from '../utils/reviewUtils';
import { findReviewer } from '../utils/reviewUtils';
import { getUser } from '../utils/loginUtils';

const ReviewsPage = ({ project, onBack }) => {
    // Sample reviews data (in a real app, this would be fetched from an API)
    const [reviews, setReviews] = useState([]);

    // Filter reviews for the current project
    //const projectReviews = reviews.filter(review => review.projectId === project.id);
    const fetchReviews = async (Id) => {

        try{

            const Review_data = await findReviewer(Id);

            if (!Array.isArray(Review_data)) {
                console.warn('API response is not an array:', Review_data);
                return [];
            }
            //map data since we are making an async call
            return Review_data.map((review) => ({
                id: review._id,
                reviewerId: review.reviewerId,
                projectId: review.projectId,
                rating: review.rating,
                comment: review.comment,
                date: review.date,
                type: review.type,
            }));


        }
        catch(error) {
            console.error('Error finding reviews:', error);
            //console.log("hello sir");
            return [];
        }
    }

    const loadReviews = async (Id) => {
        const reviews = await fetchReviews(Id);
        setReviews(reviews);
    };

    useEffect(() => {

        const Id = project.id;
        //console.log(project);
        //const fullName = localStorage.getItem('fullName');

        fetchReviews(Id)
        loadReviews(Id);



    }, [project.id]);

    // State for new review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: '',
        type: 'Collaborator'
    });

    const getAUser = async (findId) => {
        try {
            /*const response = await fetch('/api/login/getUser', {
                method: 'POST',
                body: JSON.stringify({ findId : findId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to find user!');
            }*/

            const userData = await getUser(findId);
            // if (!Array.isArray(userData) || userData.length === 0) {
            //     console.warn('API response is not a valid array:', userData);
            //     return null;
            // }
            //const userData = ud;
            //console.log(userData);
            //console.log("token", userData.token)
            //console.log('rev: ', findId);
            const decoded = jwtDecode(userData.token);
            return {
                name: decoded.name || '',
                isReviewer: userData.isReviewer,
                token: userData.token,
            };

        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
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

    const loadReviewerNames = async () => {
        const uniqueReviewerIds = [...new Set(reviews.map(r => r.reviewerId))];

        for (const reviewerId of uniqueReviewerIds) {
            if (!reviewerNames[reviewerId]) {
                await getReviewerName(reviewerId);
            }
        }
    };

    useEffect(() => {
        if (reviews.length > 0) {
            loadReviewerNames();
        }
    }, [getReviewerName, reviewerNames, reviews]);

    // Handle star rating
    const handleRatingChange = (rating) => {
        setNewReview({ ...newReview, rating });
    };

    const API_CALL_CREATE_REVIEW = async (reviewToAdd) => {
        try{
            return await submitReview(reviewToAdd)._id;

            // if (!response.ok) {
            //     throw new Error('Failed to create review');
            // }
            // else{
            //     //setMilestone_id(result._id);
            //     return result._id;
            // }
        }
        catch(error) {
            console.error('Error creating review:', error);
        }
    }

    // Handle form submission
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        // Create new review
        const reviewToAdd = {
            projectId: project.id,
            reviewerId: project.ownerId,
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date().toISOString().split('T')[0],
            type: newReview.type
        };

        await API_CALL_CREATE_REVIEW(reviewToAdd);

        setNewReview({ rating: 0, comment: '', type: 'Collaborator' });
        setReviews([...reviews, reviewToAdd]);
        setShowReviewForm(false);
    };

    // Render stars for ratings
    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                i <= rating ?
                    <Star key={i} size={16} fill="#FFC107" color="#FFC107" /> :
                    <StarOff key={i} size={16} />
            );
        }
        return <figure className="rating-stars">{stars}</figure>;
    };

    return (
        <main className="reviews-page">
            <header className="header">
                <hgroup className="header-title-group">
                    <figure className="back-arrow" onClick={onBack}>
                        <ArrowLeft />
                    </figure>
                    <h1 className="page-title">Project Reviews: {project.title}</h1>
                </hgroup>
            </header>

            <section className="project-summary">
                <h2 className="section-title">Project Summary</h2>
                <article className="project-card summary-card">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <p><strong>Owner:</strong> {project.owner}</p>
                    <p><strong>Status:</strong> {project.status}</p>
                </article>
            </section>

            <section className="reviews-section">
                <header className="section-header">
                    <h2 className="section-title">Reviews</h2>
                    <button
                        className="add-review-button"
                        onClick={() => setShowReviewForm(true)}
                    >
                        Add Review
                    </button>
                </header>

                {showReviewForm && (
                    <form className="review-form" onSubmit={handleSubmitReview}>
                        <header className="form-header">
                            <h3>Write a Review</h3>
                            <button
                                type="button"
                                className="close-button"
                                onClick={() => setShowReviewForm(false)}
                            >
                                <XCircle size={20} />
                            </button>
                        </header>

                        <fieldset className="form-body">
                            <fieldset className="rating-selector">
                                <legend>Your Rating:</legend>
                                <menu className="star-selector">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <li key={star}>
                                            <button
                                                type="button"
                                                className={`star-button ${star <= newReview.rating ? "filled" : ""}`}
                                                onClick={() => handleRatingChange(star)}
                                            >
                                                {star <= newReview.rating ?
                                                    <Star size={24} fill="#FFC107" color="#FFC107" /> :
                                                    <Star size={24} />
                                                }
                                            </button>
                                        </li>
                                    ))}
                                </menu>
                            </fieldset>

                            <fieldset className="form-group">
                                <legend>Review Type:</legend>
                                <select
                                    id="reviewType"
                                    value={newReview.type}
                                    onChange={(e) => setNewReview({...newReview, type: e.target.value})}
                                >
                                    <option value="Collaborator">Collaborator</option>
                                    <option value="Stakeholder">Stakeholder</option>
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Client">Client</option>
                                </select>
                            </fieldset>

                            <fieldset className="form-group">
                                <legend>Your Review:</legend>
                                <textarea
                                    id="reviewComment"
                                    rows="4"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                    placeholder="Share your experience with this project..."
                                    required
                                ></textarea>
                            </fieldset>

                            <footer className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowReviewForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={newReview.rating === 0 || !newReview.comment.trim()}
                                >
                                    <Send size={16} /> Submit Review
                                </button>
                            </footer>
                        </fieldset>
                    </form>
                )}

                {reviews.length === 0 ? (
                    <p className="no-reviews-message">
                        No reviews yet for this project.
                    </p>
                ) : (
                    <section className="reviews-list">
                        {reviews.map(review => (
                            <article key={review.id} className="review-card">
                                <header className="review-header">
                                    <figure className="reviewer-info">
                                        <figure className="reviewer-avatar">
                                            <UserCircle size={32} />
                                        </figure>
                                        <figcaption>
                                            <h3 className="reviewer-name">{reviewerNames[review.reviewerId] || "Loading..."}</h3>
                                            <mark className="reviewer-type">{review.type}</mark>
                                        </figcaption>
                                    </figure>
                                    <aside className="review-meta">
                                        <time className="review-date" dateTime={review.date}>
                                            <Calendar size={14} />
                                            {review.date}
                                        </time>
                                        {renderRatingStars(review.rating)}
                                    </aside>
                                </header>
                                <section className="review-body">
                                    <p className="review-comment">{review.comment}</p>
                                </section>
                            </article>
                        ))}
                    </section>
                )}
            </section>
        </main>
    );
};

export default ReviewsPage;