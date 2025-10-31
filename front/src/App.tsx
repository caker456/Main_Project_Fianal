import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { CategoryManagement } from './components/CategoryManagement';
import { ChangeHistory } from './components/ChangeHistory';
import { DocumentClassification } from './components/DocumentClassification';
import { Statistics } from './components/Statistics';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { isLoggedIn, logout } from './utils/auth';
import { AccountDetailsForm } from './components/AccountDetails';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState< 'home' | 'management' | 'history' | 'documents' | 'statistics' | 'signup' | 'profile' >('home');

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

  // 회원가입 페이지는 로그인 여부와 상관없이 접근 가능
  if (currentPage === 'signup') {
    return <SignUp onSignupSuccess={() => setCurrentPage('home')} onGoToSignIn={() => setCurrentPage('home')} />;
  }





  // 로그인 필요 페이지
  if (!loggedIn) {
    return <SignIn onLoginSuccess={() => setLoggedIn(true)} setCurrentPage={setCurrentPage} />;
  }
    return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={handleLogout} onPageChange={setCurrentPage} />
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'home' && <Home />}
          {currentPage === 'management' && <CategoryManagement />}
          {currentPage === 'documents' && <DocumentClassification />}
          {currentPage === 'history' && <ChangeHistory />}
          {currentPage === 'statistics' && <Statistics />}
          {currentPage === 'profile' && <AccountDetailsForm />}
        </main>
      </div>
    </div>
  );
}

  // return (
  //   <div className="flex h-screen bg-gray-50">
  //     <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
  //     <div className="flex-1 flex flex-col overflow-hidden">

  //       <main className="flex-1 overflow-y-auto">
  //         {currentPage === 'home' && <Home />}
  //         {currentPage === 'management' && <CategoryManagement />}
  //         {currentPage === 'documents' && <DocumentClassification />}
  //         {currentPage === 'history' && <ChangeHistory />}
  //         {currentPage === 'statistics' && <Statistics />}
  //       </main>
  //     </div>
  //   </div>
  // );

