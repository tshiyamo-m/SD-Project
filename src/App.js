import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout'; // Adjust path as needed
import LandingPage from './pages/landingpage';
import HomePage from './pages/homepage';
import ProjectsPage from './pages/projects';
import ReviewsPage from './pages/review';
// import ChatsPage from './pages/ChatsPage';
import FinancesPage from './pages/finance';
// import SettingsPage from './pages/SettingsPage';
// import LogoutPage from './pages/LogoutPage';
import './App.css';

function App() {
  return (
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/src/pages/homepage" element={<HomePage />} />
            <Route path="/src/pages/projects" element={<ProjectsPage />} />
            <Route path="/src/pages/review" element={<ReviewsPage />} />
            {/*<Route path="/src/pages/chats" element={<ChatsPage />} />*/}
            {<Route path="/src/pages/finance" element={<FinancesPage />} />}
            {/*<Route path="/src/pages/settings" element={<SettingsPage />} />*/}
            {/*<Route path="/src/pages/logout" element={<LogoutPage />} />*/}
          </Routes>
        </AppLayout>
      </BrowserRouter>
  );
}

export default App;