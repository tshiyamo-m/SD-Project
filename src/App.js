import React from 'react';
import './App.css';
import logo from './assets/logo.png';
import LoginButton from "./components/login";

function App() {

  return (
    <>
      <nav className="topbar">
        <a href="#" className="logo-link">
          <img src={logo} alt="Logo" />
          U-Collab
        </a>

        <ul className="nav-links">
          <li><a href="#">About Us</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Why Us</a></li>
        </ul>

        <LoginButton />
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

export default App;
