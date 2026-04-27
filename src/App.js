import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/Landing/LandingPage';
import DashboardApp from './DashboardApp';

function App() {
  useEffect(() => {
    const isRootPath = window.location.pathname === '/';
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const hasAuthHash =
      hash.includes('type=') ||
      hash.includes('access_token=') ||
      hash.includes('refresh_token=') ||
      hash.includes('error=');

    const hasAuthQuery =
      search.includes('type=') ||
      search.includes('code=') ||
      search.includes('token=') ||
      search.includes('token_hash=') ||
      search.includes('access_token=') ||
      search.includes('refresh_token=');

    if (isRootPath && (hasAuthHash || hasAuthQuery)) {
      const nextUrl = `/app${search}${hash}`;
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