import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { COLLECTIONS } from '../../firebase/collections';
import { subscribeCollection, updateDocById } from '../../firebase/firestoreHelpers';
import { menuItems } from '../../constants/menuItems';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeCollection<Notification>(
      COLLECTIONS.notifications,
      (items) => {
        setNotifications(items);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (userMenuOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen]);

  const formatDateTime = () => {
    const day = String(currentTime.getDate()).padStart(2, '0');
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const year = currentTime.getFullYear();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const menuItem = menuItems.find(item => item.path === path);
    
    if (menuItem) {
      return path === '/' ? 'Panel Principal' : menuItem.label;
    }
    
    return 'Panel Administrativo';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    try {
      await updateDocById(COLLECTIONS.notifications, id, { read: true });
    } catch (err) {
      // Opcional: podrías revertir el estado local si falla
      // console.error('Error al marcar notificación como leída', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    try {
      await Promise.all(
        unread.map((notif) =>
          updateDocById(COLLECTIONS.notifications, notif.id, { read: true })
        )
      );
    } catch (err) {
      // console.error('Error al marcar todas las notificaciones como leídas', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      case 'success': return '✓';
      case 'error': return '✕';
      default: return '●';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#64748b';
    }
  };

  const handleSettingsClick = () => {
    navigate('/configuracion');
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setUserMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button className="navbar-menu-btn" onClick={onMenuClick}>
            ☰
          </button>
          <div>
            <h2 className="navbar-title">{getPageTitle()}</h2>
            <p className="navbar-subtitle">{formatDateTime()}</p>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="navbar-notifications-wrapper" ref={notificationsRef}>
            <button 
              className="navbar-notifications-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notificaciones"
            >
              <span className="notifications-icon">◉</span>
              {unreadCount > 0 && (
                <span className="notifications-badge">{unreadCount}</span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="navbar-notifications-menu">
                <div className="notifications-header">
                  <h3 className="notifications-title">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button 
                      className="notifications-mark-all"
                      onClick={handleMarkAllRead}
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-empty">
                      <span>No hay notificaciones</span>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div 
                          className="notification-icon"
                          style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                        >
                          <span>{getNotificationIcon(notification.type)}</span>
                        </div>
                        <div className="notification-content">
                          <div className="notification-header">
                            <span className="notification-title">{notification.title}</span>
                            {!notification.read && <span className="notification-dot"></span>}
                          </div>
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="navbar-user-wrapper" ref={userMenuRef}>
            <div 
              className="navbar-user"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="navbar-user-avatar">
                <span>{(user?.name || 'A').charAt(0).toUpperCase()}</span>
              </div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">
                  {user?.name || 'Administrador'}
                </span>
                <span className="navbar-user-role">
                  {user?.role === 'admin' ? 'Admin' : 'Usuario'}
                </span>
              </div>
              <span className="navbar-user-arrow">{userMenuOpen ? '▲' : '▼'}</span>
            </div>
            
            {userMenuOpen && (
              <div className="navbar-user-menu">
                <button 
                  className="user-menu-item"
                  onClick={handleSettingsClick}
                >
                  <span className="menu-item-icon">⚙</span>
                  <span className="menu-item-text">Configuración</span>
                </button>
                <div className="user-menu-divider"></div>
                <button 
                  className="user-menu-item"
                  onClick={handleLogout}
                >
                  <span className="menu-item-icon">⇥</span>
                  <span className="menu-item-text">Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
