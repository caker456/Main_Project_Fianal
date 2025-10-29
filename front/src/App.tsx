import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { CategoryManagement } from './components/CategoryManagement';
import { ChangeHistory } from './components/ChangeHistory';
import { DocumentClassification } from './components/DocumentClassification';
import { Statistics } from './components/Statistics';
import SignIn from './SignIn';
import { isLoggedIn, logout } from './utils/auth';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'management' | 'history' | 'documents' | 'statistics'>('home');

  useEffect(() => {
    const checkLogin = async () => {
      const status = await isLoggedIn();
      setLoggedIn(status);
    };
    checkLogin();
  }, []);

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <SignIn onLoginSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'home' && <Home />}
          {currentPage === 'management' && <CategoryManagement />}
          {currentPage === 'documents' && <DocumentClassification />}
          {currentPage === 'history' && <ChangeHistory />}
          {currentPage === 'statistics' && <Statistics />}
        </main>
      </div>
    </div>
  );
}
