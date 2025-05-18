import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
//import { Home, Folder, MessageCircle, DollarSign, Settings, LogOut , ChartBar} from 'lucide-react';
import { Folder, DollarSign, ChartBar, Home , LogOut, MessageCircle } from 'lucide-react';


const Navbar = () => {

    const navigate = useNavigate();

    // Handle logout securely
    const handleLogout = (e) => {
        e.preventDefault();

        // Clear any authentication tokens or user data from storage
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');

        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        localStorage.removeItem('Mongo_id');

        // You can add any other session data that needs to be cleared

        // Redirect to root with replace (prevents back button navigation)
        navigate('./', { replace: true });

        // For additional security, you can also manipulate browser history
        window.history.pushState(null, '', './');

        // Optional: reload the page to ensure complete reset of app state
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <header className="navbar-header">
                <h1 className="navbar-logo">U-Collab</h1>
            </header>

            <section className="navbar-main-links">
                <nav className="primary-navigation" aria-label="Main navigation">
                    <ul>
                        <li>
                            <NavLink
                                to="/src/pages/homepage"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Home size={20}/>
                                <strong>Home</strong>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/src/pages/projects"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Folder size={20}/>
                                <strong>Projects</strong>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/src/pages/review"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <ChartBar size={20}/>
                                <strong>Reviews</strong>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/src/pages/chatspage"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <MessageCircle size={20}/>
                                <strong>Chats</strong>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/src/pages/finance"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <DollarSign size={20}/>
                                <strong>Finances</strong>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </section>

            <footer className="navbar-footer">
                <nav className="secondary-navigation" aria-label="Secondary navigation">
                    <ul>
                        {/*<li>*/}
                        {/*    <NavLink*/}
                        {/*        to="/src/pages/settings"*/}
                        {/*        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}*/}
                        {/*    >*/}
                        {/*        <Settings size={20} />*/}
                        {/*        <span>Settings</span>*/}
                        {/*    </NavLink>*/}
                        {/*</li>*/}
                        <li>
                            {/* Using a proper href with preventDefault in the handler */}
                            <a
                                href="./"
                                onClick={handleLogout}
                                className="nav-link"
                            >
                                <LogOut size={20}/>
                                <strong>Logout</strong>
                            </a>
                        </li>
                    </ul>
                </nav>
            </footer>
        </nav>
    );
};

export default Navbar;