import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
    const isAdminPage = location.pathname === '/src/pages/admin_pages/admin';

    return (
        <section className="app-container">
            {!isLandingPage && !isAdminPage && <Navbar />}
            <article className={!isLandingPage ? 'content-with-navbar' : 'content-full-width'}>
                {children}
            </article>
        </section>
    );
};

export default AppLayout;