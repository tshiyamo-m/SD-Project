import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

    return (
        <section className="app-container">
            {!isLandingPage && <Navbar />}
            <article className={!isLandingPage ? 'content-with-navbar' : 'content-full-width'}>
                {children}
            </article>
        </section>
    );
};

export default AppLayout;