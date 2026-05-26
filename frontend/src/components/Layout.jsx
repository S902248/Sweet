import React from 'react';
import Navbar from './Navbar.jsx';

const Layout = ({ children, selectedBranch, setSelectedBranch }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col">
      {/* Top Navbar (replaces Sidebar + Header) */}
      <Navbar 
        selectedBranch={selectedBranch} 
        setSelectedBranch={setSelectedBranch} 
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
