import { useState } from 'react';
import './homepage.css';

const HomePage = () => {
    const [stats] = useState({
        activeProjects: 1,
        projectsReviewed: 0,
        collaborations: 0
    });

    return (
        <article className="homepage-content">
            <header className="welcome-header">
                <h1 className="welcome-title">Good Day, Monare</h1>
            </header>

            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">Start Research Collabs</h2>
                    <p className="feature-description">
                        The best place for you to create amazing projects with the best people.
                    </p>
                    <p className="feature-cta">START YOUR DREAM PROJECT NOW</p>

                    <button className="view-projects-button">
                        View Projects Page
                    </button>
                </div>
                <figure className="feature-image">
                    {/* This would be an actual image in production */}
                </figure>
            </section>

            <section className="stats-section">
                <article className="stat-card">
                    <p className="stat-number">{stats.activeProjects}</p>
                    <h3 className="stat-title">Active Projects</h3>
                </article>

                <article className="stat-card">
                    <p className="stat-number">{stats.projectsReviewed}</p>
                    <h3 className="stat-title">Projects Reviewed</h3>
                </article>

                <article className="stat-card">
                    <p className="stat-number">{stats.collaborations}</p>
                    <h3 className="stat-title">Collaborations</h3>
                </article>
            </section>

            <aside className="notifications-panel">
                <h2 className="notifications-title">Notifications</h2>
                <p className="no-notifications">You have no new notifications</p>
            </aside>
        </article>
    );
};

export default HomePage;