import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
//import { Home, Folder, MessageCircle, DollarSign, Settings, LogOut , ChartBar} from 'lucide-react';
import { Folder, DollarSign, ChartBar, Home, MessageCircle } from 'lucide-react';

const Navbar = () => {
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
                                <span>Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/src/pages/projects"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Folder size={20}/>
                                <span>Projects</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/src/pages/review"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <ChartBar size={20}/>
                                <span>Reviews</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/src/pages/chatspage"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <MessageCircle size={20}/>
                                <span>Chats</span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/src/pages/finance"
                                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <DollarSign size={20}/>
                                <span>Finances</span>
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
                        {/*<li>*/}
                        {/*    <NavLink*/}
                        {/*        to="/src/pages/logout"*/}
                        {/*        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}*/}
                        {/*    >*/}
                        {/*        <LogOut size={20} />*/}
                        {/*        <span>Logout</span>*/}
                        {/*    </NavLink>*/}
                        {/*</li>*/}
                    </ul>
                </nav>
            </footer>
        </nav>
    );
};

export default Navbar;