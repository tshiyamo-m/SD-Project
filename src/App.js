import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout'; // Adjust path as needed
import LandingPage from './pages/landingpage';
// import HomePage from './app/HomePage';
import ProjectsPage from './pages/projects';
// import ChatsPage from './app/ChatsPage';
// import FinancesPage from './app/FinancesPage';
// import SettingsPage from './app/SettingsPage';
// import LogoutPage from './app/LogoutPage';
import './App.css';

function App() {
  return (
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/*<Route path="/src/pages/home" element={<HomePage />} />*/}
            <Route path="/src/pages/projects" element={<ProjectsPage />} />
            {/*<Route path="/src/pages/chats" element={<ChatsPage />} />*/}
            {/*<Route path="/src/pages/finances" element={<FinancesPage />} />*/}
            {/*<Route path="/src/pages/settings" element={<SettingsPage />} />*/}
            {/*<Route path="/src/pages/logout" element={<LogoutPage />} />*/}
          </Routes>
        </AppLayout>
      </BrowserRouter>
  );
}

export default App;