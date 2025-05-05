import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout'; // Adjust path as needed
import LandingPage from './pages/landingpage';
import HomePage from './pages/homepage';
import ProjectsPage from './pages/projects';
import ReviewsPage from './pages/review';
import ChatsPage from './pages/chatspage';
import FinancesPage from './pages/finance';
// import SettingsPage from './pages/SettingsPage';
// import LogoutPage from './pages/LogoutPage';
import './App.css';

function App() {
    // To fix the refreshing issue
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <main aria-busy="true" aria-live="polite">
                <progress value={null} /> {/* Indeterminate progress bar */}
                <p>Loading application...</p>
            </main>
        );
    }

    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/src/pages/homepage" element={<HomePage />} />
                    <Route path="/src/pages/projects" element={<ProjectsPage />} />
                    <Route path="/src/pages/review" element={<ReviewsPage />} />
                    <Route path="/src/pages/chatspage" element={<ChatsPage />} />
                    <Route path="/src/pages/finance" element={<FinancesPage />} />
                    {/* <Route path="/settings" element={<SettingsPage />} /> */}
                    {/* <Route path="/logout" element={<LogoutPage />} /> */}
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}

export default App;
