import React from 'react';
import './landing.css';

/**
 * LandingPage компонент
 * Загружает HTML landing page из public/landing/index.html
 */
const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <iframe
        src="/landing/index.html"
        title="Landing Page"
        className="landing-iframe"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  );
};

export default LandingPage;
