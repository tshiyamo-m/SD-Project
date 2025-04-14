/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import './App.css';
import logo from './logo.png'; 
import googleIcon from './google-icon.png';

function App() {
  return (
    <>
      <nav className="topbar">
        <a href="#" className="logo-link">
          <img src={logo} alt="Logo" />
          U-collab
        </a>

        <ul className="nav-links">
          <li><a href="#">About Us</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Why Us</a></li>
        </ul>

        <a href="#" className="google-btn">
          <img src={googleIcon} alt="Google icon" />
          Sign in/up
        </a>
      </nav>

      <main className="app">
        <header>
          <img src={logo} alt="U-collab Logo" className="hero-logo" />
          <h1>Research, Collab, and Innovate</h1>
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

export default App;
