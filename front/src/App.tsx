import { useState} from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { CategoryManagement } from './components/CategoryManagement';
import { ChangeHistory } from './components/ChangeHistory';
import { DocumentClassification } from './components/DocumentClassification';
import { Statistics } from './components/Statistics';
export default function App() {

  const [currentPage, setCurrentPage] = useState<'home' | 'management' | 'history' | 'documents' | 'statistics'>('home');

  

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
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
