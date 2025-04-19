import React from 'react';
import './landingpage.css';
import logo from '../assets/logo.png';
import LoginButton from "../components/login";

function LandingPage() {
    return (
        <>
            <nav className="topbar">
                <a href="/public" className="logo-link">
                    <img src={logo} alt="Logo" />
                    U-Collab
                </a>

                <ul className="nav-links">
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/features">Features</a></li>
                    <li><a href="/why-us">Why Us</a></li>
                </ul>

                <LoginButton/>
            </nav>

            <main className="app">
                <header>
                    <img src={logo} alt="U-collab Logo" className="hero-logo"/>
                    <h1>Research, Collaborate, and Innovate</h1>
                    <p>
                        Find the best.<br />
                        Work with the best.<br />
                        Produce the best.
                    </p>
                </header>
            </main>
        </>
    );
}

export default LandingPage;
