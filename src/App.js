import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/Landing/LandingPage';
import DashboardApp from './DashboardApp';

function App() {
  useEffect(() => {
    const isRootPath = window.location.pathname === '/';
    const hasRecoveryHash = (window.location.hash || '').includes('type=recovery');

    if (isRootPath && hasRecoveryHash) {
      const nextUrl = `/app${window.location.search || ''}${window.location.hash || ''}`;
      window.location.replace(nextUrl);
    }
  }, []);

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