import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { COLLECTIONS } from '../../firebase/collections';
import {
  deleteDocById,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../../firebase/firestoreHelpers';
import { historyService } from '../../utils/historyService';
import './Users.css';

interface User {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Administrador' | 'Cliente';
  status: 'activo' | 'inactivo';
  avatar?: string;
  address?: string;
  region?: string;
  documentType?: 'DNI' | 'CE' | 'RUC';
  documentNumber?: string;
  createdAt?: string;
  editedAt?: string;
  lastLogin?: string;
}

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    role: 'Cliente' as 'Administrador' | 'Cliente',
    status: 'activo' as 'activo' | 'inactivo',
    avatar: null as File | string | null,
    avatarPreview: '',
    address: '',
    region: 'Madre de Dios',
    documentType: 'DNI' as 'DNI' | 'CE' | 'RUC',
    documentNumber: '',
  });

  useEffect(() => {
    setError(null);
    const unsub = subscribeCollection<User>(
      COLLECTIONS.platformUsers,
      (items) => {
        setUsers(items);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      }
    );
    return () => unsub();
  }, []);

  const generateCode = (name: string, existingUsers: User[]): string => {
    // Extraer iniciales del nombre completo (primera letra de cada palabra)
    const nameWords = name.trim().split(/\s+/).filter(word => word.length > 0);
    const initials = nameWords
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    // Si no hay iniciales, usar "USR" como fallback
    const codePrefix = initials.length > 0 ? initials : 'USR';
    
    // Obtener el siguiente número secuencial basado en el orden de registro
    // Buscar el número más alto en todos los códigos existentes
    let maxNumber = 0;
    existingUsers.forEach(user => {
      if (user.code) {
        // Buscar el número al final del código (formato: INICIALES-###)
        const match = user.code.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });
    
    // El siguiente número es el máximo + 1
    const sequential = maxNumber + 1;
    
    // Formato: INICIALES-### (ej: JPG-001, MGL-002, CLM-003)
    return `${codePrefix}-${sequential.toString().padStart(3, '0')}`;
  };

  const slugFromName = (name: string): string => {
    const normalized = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return normalized || 'usuario';
  };

  const uniqueDocIdFromName = (name: string, existingIds: string[]): string => {
    const base = slugFromName(name);
    const idsSet = new Set(existingIds);
    if (!idsSet.has(base)) return base;
    let n = 2;
    while (idsSet.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  };

  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string,
    duration: number = 3000
  ) => {
    const toastOptions = {
      duration,
      className: `toast-with-progress ${type}`,
      style: {
        '--toast-duration': `${duration}ms`,
      } as React.CSSProperties,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast(message, { ...toastOptions, icon: '⚠️' });
        break;
    }
  };

  const handleOpenModal = () => {
    setFormData({
      code: '',
      name: '',
      email: '',
      phone: '',
      role: 'Cliente',
      status: 'activo',
      avatar: null,
      avatarPreview: '',
      address: '',
      region: 'Madre de Dios',
      documentType: 'DNI',
      documentNumber: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      code: '',
      name: '',
      email: '',
      phone: '',
      role: 'Cliente',
      status: 'activo',
      avatar: null,
      avatarPreview: '',
      address: '',
      region: 'Madre de Dios',
      documentType: 'DNI',
      documentNumber: '',
    });
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setIsEditModalOpen(true);
    setFormData({
      code: user.code || '',
      name: user.name,
      email: user.email,
      phone: user.phone ? user.phone.replace(/^\+51\s*/, '').trim() : '',
      role: user.role,
      status: user.status,
      avatar: user.avatar || null,
      avatarPreview: user.avatar || '',
      address: user.address || '',
      region: user.region || 'Madre de Dios',
      documentType: user.documentType || 'DNI',
      documentNumber: user.documentNumber || '',
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
    handleCloseModal();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'La imagen es demasiado grande. Por favor selecciona una imagen menor a 2MB', 4000);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Por favor selecciona un archivo de imagen válido', 4000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarRemove = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: null,
      avatarPreview: '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updatedValue = value;
      
      // Convertir nombre a mayúsculas mientras se escribe
      if (name === 'name') {
        updatedValue = value.toUpperCase();
      }
      
      const updated = { ...prev, [name]: updatedValue };
      
      // Generar código automáticamente cuando cambia el nombre (solo al crear, no al editar)
      if (name === 'name' && !editingUserId && updatedValue.trim()) {
        updated.code = generateCode(updatedValue.trim(), users);
      }
      
      return updated;
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDocumentNumber = (documentType: string, documentNumber: string): boolean => {
    if (!documentNumber) return true;
    const num = documentNumber.replace(/\D/g, '');
    if (documentType === 'DNI') return num.length === 8;
    if (documentType === 'CE') return num.length >= 8 && num.length <= 12;
    if (documentType === 'RUC') return num.length === 11;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('error', 'El nombre es requerido', 3000);
      return;
    }

    if (!formData.email.trim()) {
      showToast('error', 'El email es requerido', 3000);
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('error', 'El email no es válido', 3000);
      return;
    }

    if (users.some(u => u.email === formData.email && u.id !== editingUserId)) {
      showToast('error', 'Este email ya está registrado', 3000);
      return;
    }

    if (formData.documentNumber && !validateDocumentNumber(formData.documentType, formData.documentNumber)) {
      showToast('error', 'El número de documento no es válido', 3000);
      return;
    }

    const avatarUrl = formData.avatarPreview || (formData.avatar instanceof File ? formData.avatarPreview : formData.avatar);
    const createdAt = new Date().toISOString();
    const userName = formData.name.trim();
    const userCode = formData.code || generateCode(userName, users);
    const docId = uniqueDocIdFromName(userName, users.map((u) => u.id));
    const payload = {
      code: userCode,
      name: userName,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() ? `+51 ${formData.phone.trim()}` : undefined,
      role: formData.role,
      status: formData.status,
      avatar: (typeof avatarUrl === 'string' && avatarUrl) ? avatarUrl : undefined,
      address: formData.address.trim() || undefined,
      region: formData.region || undefined,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim() || undefined,
      createdAt,
    };

    try {
      await setDocById(COLLECTIONS.platformUsers, docId, payload);
      historyService.add({
        action: 'create',
        section: 'users',
        itemName: userName,
        itemId: docId,
        details: `Usuario "${userName}" registrado`,
      });
      showToast('success', `Usuario "${userName}" creado exitosamente`, 3000);
      handleCloseModal();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al crear usuario', 4000);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('error', 'El nombre es requerido', 3000);
      return;
    }

    if (!formData.email.trim()) {
      showToast('error', 'El email es requerido', 3000);
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('error', 'El email no es válido', 3000);
      return;
    }

    if (users.some(u => u.email === formData.email && u.id !== editingUserId)) {
      showToast('error', 'Este email ya está registrado', 3000);
      return;
    }

    if (formData.documentNumber && !validateDocumentNumber(formData.documentType, formData.documentNumber)) {
      showToast('error', 'El número de documento no es válido', 3000);
      return;
    }

    if (!editingUserId) return;

    const avatarUrl = formData.avatarPreview || (formData.avatar instanceof File ? formData.avatarPreview : formData.avatar);
    const editedAt = new Date().toISOString();
    const userName = formData.name.trim();

    const patch = {
      name: userName,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() ? `+51 ${formData.phone.trim()}` : undefined,
      role: formData.role,
      status: formData.status,
      avatar: (typeof avatarUrl === 'string' && avatarUrl) ? avatarUrl : undefined,
      address: formData.address.trim() || undefined,
      region: formData.region || undefined,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim() || undefined,
      editedAt,
    };

    try {
      await updateDocById(COLLECTIONS.platformUsers, editingUserId, patch);
      historyService.add({
        action: 'update',
        section: 'users',
        itemName: userName,
        itemId: editingUserId,
        details: `Usuario "${userName}" actualizado`,
      });
      showToast('success', `Usuario "${userName}" editado exitosamente`, 3000);
      handleCloseEditModal();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al actualizar usuario', 4000);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            El usuario <strong style="color: #ef4444;">"${user.name}"</strong> será eliminado permanentemente.
          </p>
          <p style="color: #991b1b; font-size: 0.9rem; background: #fef2f2; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
            Esta acción no se puede deshacer.
          </p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
    });

    if (result.isConfirmed) {
      try {
        await deleteDocById(COLLECTIONS.platformUsers, user.id);
        await Swal.fire({
          title: '¡Eliminado!',
          text: `El usuario "${user.name}" ha sido eliminado permanentemente`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Perfecto',
          timer: 2000,
          timerProgressBar: true,
        });
        historyService.add({
          action: 'delete',
          section: 'users',
          itemName: user.name,
          itemId: user.id,
          details: `Usuario "${user.name}" eliminado permanentemente`,
        });
        showToast('success', `Usuario "${user.name}" eliminado permanentemente`, 3000);
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Error al eliminar usuario', 4000);
      }
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
      (user.documentNumber && user.documentNumber.toLowerCase().includes(searchLower));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter((u) => u.status === 'activo').length;
  const adminUsers = filteredUsers.filter((u) => u.role === 'Administrador').length;
  const clientUsers = filteredUsers.filter((u) => u.role === 'Cliente').length;

  if (error) {
    return (
      <div className="users-page">
        <div className="page-header">
          <h1 className="page-title">Usuarios</h1>
        </div>
        <div className="users-filters-container" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1rem' }}>
          <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="users-page">
        <div className="page-header">
          <h1 className="page-title">Usuarios</h1>
        </div>
        <div className="users-filters-container">
          <p style={{ margin: 0 }}>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-description">
            Gestiona los usuarios de tu plataforma
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Nuevo Usuario
        </button>
      </div>

      <div className="users-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Total Usuarios</span>
          <span className="stat-badge-value">{totalUsers}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Usuarios Activos</span>
          <span className="stat-badge-value">{activeUsers}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Administradores</span>
          <span className="stat-badge-value">{adminUsers}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Clientes</span>
          <span className="stat-badge-value">{clientUsers}</span>
        </div>
      </div>

      <div className="users-filters-container">
      <div className="users-filters">
          <div className="filter-search">
            <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Cliente">Cliente</option>
          </select>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
        </select>
        </div>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de tabla"
          >
            📋
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista de cuadrícula"
          >
            ⊞
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Contacto</th>
                <th>Documento</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th>Fecha/Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-user">
                        {user.avatar ? (
                          <div className="table-user-avatar">
                            <img src={user.avatar} alt={user.name} className="table-user-image" />
                          </div>
                        ) : (
                          <div className="table-user-avatar">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div className="table-user-info">
                          <div className="table-user-name">{user.name}</div>
                          <div className="table-user-email">{user.email}</div>
                          {user.code && (
                            <div className="table-user-code">Código: {user.code}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase().replace('ó', 'o')}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="table-contact">
                        {user.phone && (
                          <div className="contact-item">
                            <span className="contact-label">Tel:</span>
                            <span className="contact-value">{user.phone}</span>
                          </div>
                        )}
                        {user.region && (
                          <div className="contact-item">
                            <span className="contact-label">Región:</span>
                            <span className="contact-value">{user.region}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {user.documentNumber ? (
                        <div className="table-document">
                          <span className="document-type">{user.documentType}</span>
                          <span className="document-number">{user.documentNumber}</span>
                        </div>
                      ) : (
                        <span className="no-data">Sin documento</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'activo' ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-datetime">
                        <div className="datetime-date">
                          {user.lastLogin ? formatDateTime(user.lastLogin) : 'Nunca'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-datetime">
                        <div className="datetime-date">
                          {formatDateTime(user.createdAt || user.editedAt)}
                        </div>
                        {user.editedAt && user.createdAt && user.editedAt !== user.createdAt && (
                          <div className="datetime-edited">
                            Editado: {formatDateTime(user.editedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-edit" 
                          title="Editar"
                          onClick={() => handleOpenEditModal(user)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-action btn-delete" 
                          title="Eliminar"
                          onClick={() => handleDeleteUser(user)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="table-empty">
                    <div className="empty-state">
                      <div className="empty-icon">👤</div>
                      <p>No se encontraron usuarios con los filtros seleccionados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="users-grid">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
                {user.avatar ? (
                  <div className="user-card-avatar-img">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                ) : (
            <div className="user-card-avatar">
                    {getInitials(user.name)}
            </div>
                )}
            <div className="user-card-info">
              <h3 className="user-card-name">{user.name}</h3>
              <p className="user-card-email">{user.email}</p>
                  {user.phone && (
                    <p className="user-card-phone">{user.phone}</p>
                  )}
                  <div className="user-card-meta">
                    <span className={`user-card-role ${user.role.toLowerCase().replace('ó', 'o')}`}>
                {user.role}
              </span>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'activo' ? '✓' : '✗'}
                    </span>
                  </div>
                  {user.region && (
                    <p className="user-card-location">{user.region}, Perú</p>
                  )}
            </div>
            <div className="user-card-actions">
                  <button 
                    className="btn-card-action btn-edit" 
                    title="Editar"
                    onClick={() => handleOpenEditModal(user)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-card-action btn-delete" 
                    title="Eliminar"
                    onClick={() => handleDeleteUser(user)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-full">
              <div className="empty-icon">👤</div>
              <h2>No se encontraron usuarios</h2>
              <p>No se encontraron usuarios con los filtros seleccionados</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Usuario</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-section">
                <h3 className="form-section-title">Información Personal</h3>
                
                <div className="form-group">
                  <label htmlFor="avatar" className="form-label">
                    Foto de Perfil
                  </label>
                  {formData.avatarPreview ? (
                    <div className="avatar-preview-container">
                      <img 
                        src={formData.avatarPreview} 
                        alt="Preview" 
                        className="avatar-preview"
                      />
                      <button 
                        type="button" 
                        className="btn-remove-avatar"
                        onClick={handleAvatarRemove}
                      >
                        Eliminar foto
                      </button>
                    </div>
                  ) : (
                    <div className="avatar-upload-area">
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="avatar-input"
                      />
                      <label htmlFor="avatar" className="avatar-upload-label">
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">Haz clic para subir foto</span>
                        <span className="upload-hint">PNG, JPG hasta 2MB</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="code" className="form-label">
                    Código
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    className="form-input"
                    readOnly
                    disabled
                    style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                  />
                  <span className="form-hint">Código generado automáticamente</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Nombre Completo <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: Juan Pérez García"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: juan@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Teléfono
                    </label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+51</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input phone-input"
                        placeholder="Ej: 987 654 321"
                      />
                    </div>
                    <span className="form-hint">Se agregará automáticamente el código +51</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role" className="form-label">
                      Rol <span className="required">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="Cliente">Cliente</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Estado <span className="required">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Documento de Identidad</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="documentType" className="form-label">
                      Tipo de Documento
                    </label>
                    <select
                      id="documentType"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="documentNumber" className="form-label">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      id="documentNumber"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: 12345678"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Dirección</h3>
                
                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ej: Av. Principal 123"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Ubicación
                  </label>
                  <div className="location-display">
                    <span className="location-text">Madre de Dios, Perú</span>
                  </div>
                  <span className="form-hint">Región fija establecida para todos los usuarios</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Usuario</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="user-form">
              <div className="form-section">
                <h3 className="form-section-title">Información Personal</h3>
                
                <div className="form-group">
                  <label htmlFor="edit-avatar" className="form-label">
                    Foto de Perfil
                  </label>
                  {formData.avatarPreview ? (
                    <div className="avatar-preview-container">
                      <img 
                        src={formData.avatarPreview} 
                        alt="Preview" 
                        className="avatar-preview"
                      />
                      <button 
                        type="button" 
                        className="btn-remove-avatar"
                        onClick={handleAvatarRemove}
                      >
                        Eliminar foto
                      </button>
                    </div>
                  ) : (
                    <div className="avatar-upload-area">
                      <input
                        type="file"
                        id="edit-avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="avatar-input"
                      />
                      <label htmlFor="edit-avatar" className="avatar-upload-label">
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">Haz clic para subir foto</span>
                        <span className="upload-hint">PNG, JPG hasta 2MB</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-code" className="form-label">
                    Código
                  </label>
                  <input
                    type="text"
                    id="edit-code"
                    name="code"
                    value={formData.code}
                    className="form-input"
                    readOnly
                    disabled
                    style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                  />
                  <span className="form-hint">Código del usuario (no editable)</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-name" className="form-label">
                      Nombre Completo <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-phone" className="form-label">
                      Teléfono
                    </label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+51</span>
                      <input
                        type="tel"
                        id="edit-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input phone-input"
                        placeholder="Ej: 987 654 321"
                      />
                    </div>
                    <span className="form-hint">Se agregará automáticamente el código +51</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-role" className="form-label">
                      Rol <span className="required">*</span>
                    </label>
                    <select
                      id="edit-role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="Cliente">Cliente</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-status" className="form-label">
                      Estado <span className="required">*</span>
                    </label>
                    <select
                      id="edit-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Documento de Identidad</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-documentType" className="form-label">
                      Tipo de Documento
                    </label>
                    <select
                      id="edit-documentType"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-documentNumber" className="form-label">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      id="edit-documentNumber"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Dirección</h3>
                
                <div className="form-group">
                  <label htmlFor="edit-address" className="form-label">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Ubicación
                  </label>
                  <div className="location-display">
                    <span className="location-text">Madre de Dios, Perú</span>
                  </div>
                  <span className="form-hint">Región fija establecida para todos los usuarios</span>
            </div>
          </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCloseEditModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  Guardar Cambios
                </button>
              </div>
            </form>
      </div>
        </div>
      )}
    </div>
  );
};
