import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Feed } from './Feed';
import { Messages } from './Messages';
import { Knowledge } from './Knowledge';
import { Profile } from './Profile';
import { Search } from './Search';
import { QnA } from './QnA';
import { Opportunities } from './Opportunities';
import { Campus } from './Campus';
import { BookOpen} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed currentUser={currentUser} />;
      case 'messages':
        return <Messages currentUser={currentUser} />;
      case 'knowledge':
        return <Knowledge currentUser={currentUser} />;
      case 'qna':
        return <QnA currentUser={currentUser} />;
      case 'opportunities':
        return <Opportunities currentUser={currentUser} />;
      case 'campus':
        return <Campus currentUser={currentUser} />;
      case 'profile':
        return <Profile currentUser={currentUser} />;
      case 'search':
        return <Search currentUser={currentUser} />;
      default:
        return <Feed currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg mr-2">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary-600">Studium</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        {renderContent()}
      </div>
    </div>
  );
};