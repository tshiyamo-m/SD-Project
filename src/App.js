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
import { UserProvider } from "./components/UserContext";
import AdminPage from "./pages/admin_pages/admin";
import { Toaster } from "sonner";

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
      <UserProvider>
          <BrowserRouter>
              <AppLayout>
                  <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/src/pages/homepage" element={<HomePage />} />
                      <Route path="/src/pages/projects" element={<ProjectsPage />} />
                      <Route path="/src/pages/review" element={<ReviewsPage />} />
                      {<Route path="/src/pages/chatspage" element={<ChatsPage />} />}
                      {<Route path="/src/pages/finance" element={<FinancesPage />} />}
                      {/*<Route path="/src/pages/settings" element={<SettingsPage />} />*/}
                      {/*<Route path="/src/pages/logout" element={<LogoutPage />} />*/}
                      <Route path="/src/pages/admin_pages/admin" element={<AdminPage />} />
                  </Routes>
              </AppLayout>
          </BrowserRouter>
         <Toaster position="bottom-right" /> 
      </UserProvider>

  );
}

export default App;
