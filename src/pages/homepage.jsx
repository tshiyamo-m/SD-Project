import { useState, useEffect } from 'react';
import './homepage.css';
//import { jwtDecode } from 'jwt-decode';

    
const HomePage = () => {
    const [name, setName] = useState("");
    const [stats, setStats] = useState({
        activeProjects: 0,
        projectsReviewed: 0,
        collaborations: 0
    });

    //React hook to make sure code only runs when homepage renders
    useEffect(() => {
        // This will only run when the component mounts
        //const token = localStorage.getItem('token');
        const fullName = localStorage.getItem('fullName').split(" ");
        setName(fullName[0]);
        //console.log("token: ", token);
                                                    
        /*if (token) {
            try {
                const decodedUser = jwtDecode(token);
                if (decodedUser && decodedUser.name) {
                    const fullName = decodedUser.name.split(" ");
                    setName(fullName[0]);
                    
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                // Handle invalid token (optional: clear the token)
                // localStorage.removeItem("token");
            }
        }*/

    }, []); 
    useEffect(() => {

        const Id = localStorage.getItem('Mongo_id');
        //console.log(Id)
        const fetchProjects = async () => {

            try{
                const response = await fetch('/api/Projects/find', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: Id,
                    }),
                    headers: {
                        'Content-Type': 'application/json' 
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to find projects!');
                }
                else{
                    const data = await response.json();
                    //const num_projects = data.projects.length
                    
                    if (data != null){
                        const updateStats = () => {
                            setStats(prevStats => ({
                                ...prevStats,          // Copy all existing properties
                                activeProjects: data.length,  // Update specific property
                            }));
                        };
                        //console.log(data.projects.length);
                        updateStats();
                    }
                    
                } 
            }
            catch(error) {
                console.error('Error finding projects:', error);
            }
        }
        fetchProjects();

    }, []);

//  WHY IS THERE A DIV IN THIS CODE???
    return (
        <article className="homepage-content">
            <header className="welcome-header">
                <h1 className="welcome-title">Good Day, {name}</h1>
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