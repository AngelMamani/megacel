import { Link, NavLink } from 'react-router-dom';
import { menuItems } from '../../constants/menuItems';
import logo from '../../assets/logo3.png';
import { SidebarMenuIcon } from './SidebarMenuIcons.tsx';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Menú administrativo">
      <div className="sidebar__glow" aria-hidden />

      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-brand" onClick={onClose}>
          <span className="sidebar-brand__logo-shell">
            <img src={logo} alt="MEGA CEL" className="sidebar-brand__logo" />
          </span>
          <span className="sidebar-brand__copy">
            <span className="sidebar-brand__name">MEGA CEL</span>
            <span className="sidebar-brand__tag">Panel Administrativo</span>
          </span>
        </Link>
        <button type="button" className="sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
          ×
        </button>
      </div>

      <div className="sidebar-accent" aria-hidden />

      <nav className="sidebar-nav">
        <p className="sidebar-nav__label">Menú</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-nav-item__icon">
              <SidebarMenuIcon Id={item.id} />
            </span>
            <span className="sidebar-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer__brand">MEGA CEL</p>
        <p className="sidebar-version">Admin v1.0.0</p>
      </div>
    </aside>
  );
};
