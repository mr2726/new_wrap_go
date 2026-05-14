import React, { useEffect } from 'react';
import {supabase} from "../../data/supabase"
import './landing.css';

/**
 * LandingPage компонент
 * Загружает HTML landing page из public/landing/index.html
 */

const LandingPage = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.replace('/app');
      }
    });
  }, []);

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
