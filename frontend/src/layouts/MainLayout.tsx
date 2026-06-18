import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, MessageCircle, User, Activity } from 'lucide-react';

const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-6 h-6" />, label: 'Home', path: '/' },
    { icon: <Search className="w-6 h-6" />, label: 'Discover', path: '/discover' },
    { icon: <Heart className="w-6 h-6" />, label: 'Matches', path: '/matches' },
    { icon: <MessageCircle className="w-6 h-6" />, label: 'Messages', path: '/messages' },
    { icon: <User className="w-6 h-6" />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.label} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 pt-8 z-50">
        <div className="px-8 mb-10">
          <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight flex items-center">
            Bridge
            <span className="w-2 h-2 rounded-full bg-indigo-500 ml-1 mb-4"></span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.label} 
                to={item.path}
                  className={`flex items-center px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
              >
                  <div className={`mr-3 transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</div>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-16 md:pb-0 relative h-screen overflow-y-auto hide-scrollbar">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
