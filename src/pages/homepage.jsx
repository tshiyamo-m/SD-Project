import { useState, useEffect } from 'react';
import './homepage.css';
import { findProject } from '../utils/projectUtils';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [name, setName] = useState("");
    const [stats, setStats] = useState({
        activeProjects: 0,
        projectsReviewed: 0,
        collaborations: 0
    });

    useEffect(() => {
        try {
            const fullName = localStorage.getItem('fullName');
            // Handle cases: null/undefined, empty string, or valid string
            const firstName = fullName ? fullName.split(' ')[0] : '';
            setName(firstName);
        } catch (error) {
            console.error('Error processing name:', error);
            setName('');
        }
    }, []);

    //const fetchAllReviews = () => {

    //}

    const navigate = useNavigate();


    const fetchProjects = async (Id) => {
        try {
            const data = await findProject(Id);
            if (data != null) {
                setStats(prevStats => ({
                    ...prevStats,
                    activeProjects: data.length,
                }));
            }
        } catch(error) {
            console.error('Error finding projects:', error);
        }
    };

    useEffect(() => {
        const Id = localStorage.getItem('Mongo_id');
        fetchProjects(Id);
    }, []);

    return (
        <main className="homepage-layout">
            <section className="main-content">
                <header className="welcome-header">
                    <h1 className="welcome-title">Good Day, {name}</h1>
                </header>

                <section className="feature-section">
                    <section className="feature-content">
                        <h2 className="feature-title">Start Research Collabs</h2>
                        <p className="feature-description">
                            The best place for you to create amazing projects with the best people.
                        </p>
                        <p className="feature-cta">START YOUR DREAM PROJECT NOW</p>
                        <button 
                            className="view-projects-button"
                            onClick={() => navigate('/src/pages/projects')}>                        
                            View Projects Page
                        </button>
                    </section>
                    <figure className="feature-image">
                        {/* Image would go here */}
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
            </section>

            <aside className="notifications-sidebar">
                <h2 className="notifications-title">Notifications</h2>
                <p className="no-notifications">You have no new notifications</p>
            </aside>
        </main>
    );
};

export default HomePage;