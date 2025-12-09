import React from 'react';
import { ViewState } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, onLogout }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-neutral-900/50 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-center h-24 mb-6">
            <h1 className="text-2xl font-bold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">ShopWith</span>
              <span className="text-violet-400">Kylie</span>
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  setIsOpen(false);
                }}
                className={`group w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg 
                  className={`w-5 h-5 mr-3 transition-colors ${currentView === item.id ? 'fill-white' : 'fill-neutral-500 group-hover:fill-white'}`} 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center min-w-0">
                <div className="relative">
                  <img 
                    src="https://picsum.photos/seed/user/100/100" 
                    alt="User" 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Admin User</p>
                  <p className="text-xs text-neutral-500 truncate">Store Manager</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="ml-2 p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Log Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;