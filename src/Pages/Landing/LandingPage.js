import { useEffect } from 'react';

/**
 * LandingPage компонент
 * Development fallback for the static landing document served by Vercel.
 */

const LandingPage = () => {
  useEffect(() => {
    window.location.replace('/landing/index.html');
  }, []);

  return null;
};

export default LandingPage;
