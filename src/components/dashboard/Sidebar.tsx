import React from 'react';
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  User, 
  Search, 
  LogOut,
  HelpCircle,
  Briefcase,
  MapPin,
  Award,
  Users
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout,
  sidebarOpen,
  setSidebarOpen
}) => {
  const menuItems = [
    { id: 'feed', icon: Home, label: 'Community Feed' },
    { id: 'knowledge', icon: BookOpen, label: 'Knowledge Hub' },
    { id: 'qna', icon: HelpCircle, label: 'Q&A' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'opportunities', icon: Briefcase, label: 'Opportunities' },
    { id: 'campus', icon: MapPin, label: 'Campus Life' },
    { id: 'search', icon: Search, label: 'Discover' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleMenuClick = (itemId: string) => {
    setActiveTab(itemId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
      flex flex-col transition-all duration-300 transform lg:transform-none
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="bg-primary-600 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary-600 ml-3">
            Studium
          </h1>
        </div>
        <div className="mt-4 flex justify-end lg:block hidden">
          <ThemeToggle />
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser.branch} • Year {currentUser.year}
            </p>
          </div>
        </div>
        
        {/* Karma & Badges */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{currentUser.karma} Karma</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-primary-500 mr-1" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{currentUser.connections}</span>
          </div>
        </div>
        
        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          {currentUser.badges.slice(0, 2).map((badge: string, index: number) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};