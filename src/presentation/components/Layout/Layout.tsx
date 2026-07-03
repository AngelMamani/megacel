import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import './Layout.css';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="layout-main">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
