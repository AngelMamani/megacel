import { NavLink } from 'react-router-dom';
import { menuItems } from '../../constants/menuItems';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-logo">MEGA CEL</h1>
        <p className="sidebar-subtitle">Panel Administrativo</p>
        <button className="sidebar-close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  );
};
