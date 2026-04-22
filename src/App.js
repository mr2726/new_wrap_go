import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/Landing/LandingPage';
import DashboardApp from './DashboardApp';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page на главной странице */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard приложение на /app */}
        <Route path="/app/*" element={<DashboardApp />} />
        
        {/* Перенаправление неизвестных путей на /app */}
        <Route path="*" element={<DashboardApp />} />
      </Routes>
    </Router>
  );
}

export default App;