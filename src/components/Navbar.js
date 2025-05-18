import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { Folder, DollarSign, ChartBar, Home, LogOut, MessageCircle } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleNav = () => {
        setIsOpen(!isOpen);
    };

    const closeNav = () => {
        setIsOpen(false);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        localStorage.removeItem('Mongo_id');
        navigate('./', { replace: true });
        window.history.pushState(null, '', './');
        window.location.reload();
    };

    // Create a NavLink wrapper that closes the menu
    const CustomNavLink = ({ to, icon: Icon, label }) => {
        return (
            <NavLink
                to={to}
                className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeNav}
            >
                <Icon size={20}/>
                <strong>{label}</strong>
            </NavLink>
        );
    };

    return (
        <nav className="navbar">
            <header className="navbar-header">
                <h1 className="navbar-logo">U-Collab</h1>
                <button
                    className="navbar-toggle"
                    onClick={toggleNav}
                    aria-label="Toggle navigation"
                    aria-expanded={isOpen}
                >
                    ☰
                </button>
            </header>

            <section className={`navbar-content ${isOpen ? 'active' : ''}`}>
                <nav className="primary-navigation" aria-label="Main navigation">
                    <ul>
                        <li>
                            <CustomNavLink
                                to="/src/pages/dashboard"
                                icon={Home}
                                label="Home"
                            />
                        </li>
                        <li>
                            <CustomNavLink
                                to="/src/pages/projects"
                                icon={Folder}
                                label="Projects"
                            />
                        </li>
                        <li>
                            <CustomNavLink
                                to="/src/pages/review"
                                icon={ChartBar}
                                label="Reviews"
                            />
                        </li>
                        <li>
                            <CustomNavLink
                                to="/src/pages/chatspage"
                                icon={MessageCircle}
                                label="Chats"
                            />
                        </li>
                        <li>
                            <CustomNavLink
                                to="/src/pages/finance"
                                icon={DollarSign}
                                label="Finances"
                            />
                        </li>
                    </ul>
                </nav>

                <footer className="navbar-footer">
                    <nav className="secondary-navigation" aria-label="Secondary navigation">
                        <ul>
                            <li>
                                <a
                                    href="./"
                                    onClick={(e) => {
                                        closeNav();
                                        handleLogout(e);
                                    }}
                                    className="nav-link"
                                >
                                    <LogOut size={20}/>
                                    <strong>Logout</strong>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </footer>
            </section>
        </nav>
    );
};

export default Navbar;