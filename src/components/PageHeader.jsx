import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

const PageHeader = ({ heading, backButton = false }) => {
    const navigate = useNavigate();

    return (
        <header className="page-header" style={{ background: 'transparent' }}>
            <section className="header-left">
                {backButton && (
                    <button
                        onClick={() => navigate(-1)}
                        className="back-button"
                        aria-label="Go back"
                    >
                        &larr;
                    </button>
                )}
                <h1 className="page-heading">{heading}</h1>
            </section>

            {/*{userName && (*/}
            {/*    <address className="user-name">*/}
            {/*        {userName}*/}
            {/*    </address>*/}
            {/*)}*/}
        </header>
    );
};

export default PageHeader;