import { useState, useEffect } from 'react';
import AuthScreen from '@/components/AuthScreen';
import MainMenu from '@/components/MainMenu';
import { getCurrentUser } from '@/lib/auth';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <MainMenu onLogout={handleLogout} />;
}
