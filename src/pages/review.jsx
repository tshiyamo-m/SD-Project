import { useState } from 'react';
import { Search, Bell, User, MoreVertical, ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import './review.css';

const ReviewerPage = () => {
    const [proposals, setProposals] = useState([
        {
            id: 1,
            title: "Neural Network for Climate Prediction",
            description: "Using deep learning to improve long-term climate forecasting models.",
            submitter: "Dr. Sarah Williams",
            institution: "Climate Research Institute",
            status: "Pending Review",
            field: "Environmental Science",
            submitted: "2025-03-15",
            deadline: "2025-04-30",
            keywords: ["Deep Learning", "Climate Science", "Forecasting"],
            score: null,
            comments: ""
        },
        {
            id: 2,
            title: "Quantum Computing Applications in Cryptography",
            description: "Exploring post-quantum cryptographic methods to enhance data security.",
            submitter: "Prof. David Chen",
            institution: "Tech University",
            status: "In Progress",
            field: "Computer Science",
            submitted: "2025-03-01",
            deadline: "2025-04-20",
            keywords: ["Quantum Computing", "Cryptography", "Security"],
            score: 7,
            comments: "Interesting approach but needs more discussion on implementation challenges."
        },
        {
            id: 3,
            title: "Biodegradable Plastics from Agricultural Waste",
            description: "Developing eco-friendly plastics using byproducts from corn production.",
            submitter: "Dr. Aisha Patel",
            institution: "Green Materials Lab",
            status: "Completed",
            field: "Material Science",
            submitted: "2025-02-10",
            deadline: "2025-03-25",
            keywords: ["Biodegradable", "Sustainable Materials", "Waste Reduction"],
            score: 9,
            comments: "Excellent proposal with strong methodology and clear impact potential."
        }
    ]);

    const [selectedProposal, setSelectedProposal] = useState(null);
    const [reviewForm, setReviewForm] = useState({
        score: 0,
        comments: ""
    });

    const handleReviewSubmit = (proposalId, decision) => {
        setProposals(proposals.map(proposal => {
            if (proposal.id === proposalId) {
                return {
                    ...proposal,
                    status: decision === 'accept' ? 'Accepted' : 'Rejected',
                    score: reviewForm.score,
                    comments: reviewForm.comments
                };
            }
            return proposal;
        }));
        setSelectedProposal(null);
        setReviewForm({ score: 0, comments: "" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReviewForm({
            ...reviewForm,
            [name]: name === 'score' ? parseInt(value) || 0 : value
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending Review':
                return 'status-pending';
            case 'In Progress':
                return 'status-progress';
            case 'Completed':
                return 'status-completed';
            case 'Accepted':
                return 'status-accepted';
            case 'Rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    if (selectedProposal) {
        const proposal = proposals.find(p => p.id === selectedProposal);

        return (
            <article className="reviewer-page-content">
                <header className="flex justify-between items-center mb-8">
                    <header className="header">
                        <hgroup className="header-title-group">
                            <figure className="back-arrow" onClick={() => setSelectedProposal(null)}>
                                <ArrowLeft />
                            </figure>
                            <h1 className="page-title">Review Proposal</h1>
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

                <section className="review-proposal-detail">
                    <article className="proposal-card detailed">
                        <header className="proposal-header">
                            <h2 className="proposal-title">{proposal.title}</h2>
                            <p className={`proposal-status ${getStatusClass(proposal.status)}`}>{proposal.status}</p>
                        </header>
                        <p className="proposal-description">{proposal.description}</p>
                        <dl className="proposal-meta">
                            <dt>Submitter:</dt>
                            <dd>{proposal.submitter}.</dd>

                            <dt>Institution:</dt>
                            <dd>{proposal.institution}.</dd>
                        </dl>
                        <dl className="proposal-meta">
                            <dt>Field:</dt>
                            <dd>{proposal.field}.</dd>
                        </dl>
                        <dl className="proposal-meta">
                            <dt>Submitted:</dt>
                            <dd>{proposal.submitted}.</dd>

                            <dt>Review Deadline:</dt>
                            <dd>{proposal.deadline}.</dd>
                        </dl>
                        <dl className="proposal-meta">
                            <dt>Keywords:</dt>
                            <dd>{proposal.keywords.join(", ")}.</dd>
                        </dl>
                    </article>

                    <form className="review-form">
                        <fieldset className="review-fieldset">
                            <legend>Your Review</legend>

                            <label htmlFor="score" className="score-label">Score (1-10):</label>
                            <input
                                type="number"
                                id="score"
                                name="score"
                                min="1"
                                max="10"
                                value={reviewForm.score}
                                onChange={handleInputChange}
                                className="score-input"
                            />

                            <label htmlFor="comments" className="comments-label">Comments:</label>
                            <textarea
                                id="comments"
                                name="comments"
                                value={reviewForm.comments}
                                onChange={handleInputChange}
                                className="comments-input"
                                placeholder="Enter your review comments here..."
                                rows="5"
                            ></textarea>
                        </fieldset>

                        <footer className="review-actions">
                            <button
                                type="button"
                                className="reject-button"
                                onClick={() => handleReviewSubmit(proposal.id, 'reject')}
                            >
                                <XCircle size={20} />
                                Reject Proposal
                            </button>
                            <button
                                type="button"
                                className="accept-button"
                                onClick={() => handleReviewSubmit(proposal.id, 'accept')}
                            >
                                <CheckCircle size={20} />
                                Accept Proposal
                            </button>
                        </footer>
                    </form>
                </section>
            </article>
        );
    }

    return (
        <article className="reviewer-page-content">
            <header className="flex justify-between items-center mb-8">
                <header className="header">
                    <hgroup className="header-title-group">
                        <figure className="back-arrow">
                            <ArrowLeft />
                        </figure>
                        <h1 className="page-title">My Reviews</h1>
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

            <section className="review-filters">
                <button className="filter-button active">All Proposals</button>
                <button className="filter-button">Pending Review</button>
                <button className="filter-button">In Progress</button>
                <button className="filter-button">Completed</button>
            </section>

            <section className="space-y-4">
                {proposals.map(proposal => (
                    <article key={proposal.id} className="proposal-card">
                        <header className="proposal-header">
                            <h2 className="proposal-title">{proposal.title}</h2>
                            <p className={`proposal-status ${getStatusClass(proposal.status)}`}>{proposal.status}</p>
                        </header>
                        <p className="proposal-description">{proposal.description}</p>
                        <dl className="proposal-meta">
                            <dt>Submitter:</dt>
                            <dd>{proposal.submitter}.</dd>

                            <dt>Institution:</dt>
                            <dd>{proposal.institution}.</dd>
                        </dl>
                        <dl className="proposal-meta">
                            <dt>Field:</dt>
                            <dd>{proposal.field}.</dd>
                        </dl>
                        <dl className="proposal-meta">
                            <dt>Submitted:</dt>
                            <dd>{proposal.submitted}.</dd>

                            <dt>Review Deadline:</dt>
                            <dd>{proposal.deadline}.</dd>
                        </dl>
                        <dl className="proposal-meta">
                            <dt>Keywords:</dt>
                            <dd>{proposal.keywords.join(", ")}.</dd>
                        </dl>
                        {proposal.score && (
                            <dl className="proposal-meta">
                                <dt>Your Score:</dt>
                                <dd>{proposal.score}/10.</dd>
                            </dl>
                        )}
                        {proposal.comments && (
                            <dl className="proposal-meta comments-meta">
                                <dt>Your Comments:</dt>
                                <dd className="comments-text">{proposal.comments}</dd>
                            </dl>
                        )}
                        <footer className="proposal-footer">
                            <button
                                className="review-button"
                                onClick={() => setSelectedProposal(proposal.id)}
                            >
                                <MessageSquare size={16} />
                                Review
                            </button>
                        </footer>
                    </article>
                ))}
            </section>
        </article>
    );
}

export default ReviewerPage;