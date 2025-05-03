import { useState } from 'react';
import { ArrowLeft, Star, StarOff, Send, XCircle, UserCircle, Calendar } from 'lucide-react';
import './projects.css';
import './viewreview.css';

const ReviewsPage = ({ project, onBack }) => {
    // Sample reviews data (in a real app, this would be fetched from an API)
    const [reviews, setReviews] = useState([
        {
            id: 1,
            projectId: 1,
            reviewerId: "user123",
            reviewerName: "Michael Brown",
            rating: 4,
            comment: "Excellent project with clear milestones. The team was responsive and the implementation met our specifications.",
            date: "2025-04-15",
            type: "Collaborator"
        },
        {
            id: 2,
            projectId: 1,
            reviewerId: "user456",
            reviewerName: "Sarah Johnson",
            rating: 5,
            comment: "Outstanding work! The AI diagnostic tool already shows promising results in our early tests. Looking forward to the full implementation.",
            date: "2025-04-12",
            type: "Stakeholder"
        },
        {
            id: 3,
            projectId: 2,
            reviewerId: "user789",
            reviewerName: "David Chen",
            rating: 3,
            comment: "Good progress, but timeline estimates were optimistic. Would recommend more buffer time for future planning phases.",
            date: "2025-04-10",
            type: "Project Manager"
        }
    ]);

    // Filter reviews for the current project
    const projectReviews = reviews.filter(review => review.projectId === project.id);

    // State for new review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: '',
        type: 'Collaborator'
    });

    // Handle star rating
    const handleRatingChange = (rating) => {
        setNewReview({ ...newReview, rating });
    };

    // Handle form submission
    const handleSubmitReview = (e) => {
        e.preventDefault();

        // Create new review
        const reviewToAdd = {
            id: reviews.length + 1,
            projectId: project.id,
            reviewerId: "currentUser", // In a real app, this would come from authentication
            reviewerName: "Monare", // This would also come from authentication
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date().toISOString().split('T')[0],
            type: newReview.type
        };

        // Add to reviews and reset form
        setReviews([...reviews, reviewToAdd]);
        setNewReview({ rating: 0, comment: '', type: 'Collaborator' });
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

                {projectReviews.length === 0 ? (
                    <p className="no-reviews-message">
                        No reviews yet for this project.
                    </p>
                ) : (
                    <section className="reviews-list">
                        {projectReviews.map(review => (
                            <article key={review.id} className="review-card">
                                <header className="review-header">
                                    <figure className="reviewer-info">
                                        <figure className="reviewer-avatar">
                                            <UserCircle size={32} />
                                        </figure>
                                        <figcaption>
                                            <h3 className="reviewer-name">{review.reviewerName}</h3>
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