import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Users.css';
import { useApplication, useInfrastructure } from '../../providers/DependencyProvider.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import type { PlatformUser } from '../../../domain/entities/PlatformUser.ts';
import { PLATFORM_USER_ROLE, type PlatformUserRole } from '../../../domain/value-objects/PlatformUserRole.ts';
import type { PlatformUserStatus } from '../../../domain/value-objects/PlatformUserStatus.ts';
import type { DocumentType } from '../../../domain/value-objects/DocumentType.ts';
import { UsersHub } from './components/UsersHub.tsx';
import { UsersAdminPanel } from './components/UsersAdminPanel.tsx';
import { UsersPageHeader } from './components/UsersPageHeader.tsx';
import { UsersKpiStrip } from './components/UsersKpiStrip.tsx';
import { UsersCommandBar } from './components/UsersCommandBar.tsx';
import { UsersClientTableView } from './components/UsersClientTableView.tsx';
import { UsersClientCard } from './components/UsersClientCard.tsx';
import { IconUsers } from './components/UserIcons.tsx';

type UsersPanel = 'hub' | 'admins' | 'clients';

export const Users = () => {
  const { repositories } = useInfrastructure();
  const application = useApplication();
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [pendingUserIds, setPendingUserIds] = useState<Set<string>>(() => new Set());
  const optimisticUsersRef = useRef<Map<string, PlatformUser>>(new Map());
  const deletingUserIdsRef = useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<UsersPanel>('hub');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const deferredSearch = useDeferredValue(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    role: PLATFORM_USER_ROLE.Customer as PlatformUserRole,
    status: 'activo' as PlatformUserStatus,
    avatar: null as File | string | null,
    avatarPreview: '',
    address: '',
    region: 'Madre de Dios',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
  });

  useEffect(() => {
    setError(null);
    const unsub = repositories.platformUser.subscribe(
      (items) => {
        const server = items.filter((item) => !deletingUserIdsRef.current.has(item.id));
        const serverIds = new Set(server.map((item) => item.id));

        serverIds.forEach((id) => optimisticUsersRef.current.delete(id));
        setPendingUserIds((prev) => {
          const next = new Set(prev);
          let changed = false;
          serverIds.forEach((id) => {
            if (next.delete(id)) changed = true;
          });
          return changed ? next : prev;
        });

        deletingUserIdsRef.current.forEach((id) => {
          if (!serverIds.has(id) && !items.some((item) => item.id === id)) {
            deletingUserIdsRef.current.delete(id);
          }
        });

        const pending = Array.from(optimisticUsersRef.current.values()).filter(
          (user) => !serverIds.has(user.id)
        );
        setUsers([...pending, ...server]);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      }
    );
    return () => unsub();
  }, [repositories.platformUser]);

  useEffect(() => {
    const HandleKeyDown = (event: KeyboardEvent) => {
      if (activePanel !== 'clients') return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && searchTerm) {
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', HandleKeyDown);
    return () => window.removeEventListener('keydown', HandleKeyDown);
  }, [activePanel, searchTerm]);

  const clientUsers = useMemo(
    () => users.filter((user) => user.role === PLATFORM_USER_ROLE.Customer),
    [users]
  );

  const generateCode = (name: string, existingUsers: PlatformUser[]): string => {
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
      password: '',
      phone: '',
      role: PLATFORM_USER_ROLE.Customer as PlatformUserRole,
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
      password: '',
      phone: '',
      role: PLATFORM_USER_ROLE.Customer as PlatformUserRole,
      status: 'activo',
      avatar: null,
      avatarPreview: '',
      address: '',
      region: 'Madre de Dios',
      documentType: 'DNI',
      documentNumber: '',
    });
  };

  const handleOpenEditModal = (user: PlatformUser) => {
    setEditingUserId(user.id);
    setIsEditModalOpen(true);
    setFormData({
      code: user.code || '',
      name: user.name,
      email: user.email,
      password: '',
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
        updated.code = generateCode(updatedValue.trim(), clientUsers);
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

  const handleSubmit = (e: React.FormEvent) => {
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

    const trimmedPassword = formData.password.trim();
    if (!trimmedPassword) {
      showToast('error', 'La contraseña es requerida', 3000);
      return;
    }

    if (trimmedPassword.length < 6) {
      showToast('error', 'La contraseña debe tener al menos 6 caracteres', 3000);
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
    const userCode = formData.code || generateCode(userName, clientUsers);
    const docId = uniqueDocIdFromName(userName, clientUsers.map((u) => u.id));

    const newUser: PlatformUser = {
      id: docId,
      code: userCode,
      name: userName,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() ? `+51 ${formData.phone.trim()}` : undefined,
      role: PLATFORM_USER_ROLE.Customer as PlatformUserRole,
      status: formData.status,
      avatar: typeof avatarUrl === 'string' && avatarUrl ? avatarUrl : undefined,
      address: formData.address.trim() || undefined,
      region: formData.region || undefined,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim() || undefined,
      createdAt,
    };

    optimisticUsersRef.current.set(docId, newUser);
    setPendingUserIds((prev) => new Set(prev).add(docId));
    setUsers((prev) => [newUser, ...prev.filter((user) => user.id !== docId)]);

    handleCloseModal();
    showToast('success', `Cliente "${userName}" agregado — sincronizando en segundo plano`, 2500);

    void (async () => {
      try {
        await application.platformUsers.create.execute({
          user: newUser,
          password: trimmedPassword,
          actorEmail: authUser?.email,
          actorName: authUser?.name,
        });
      } catch (err) {
        optimisticUsersRef.current.delete(docId);
        setPendingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
        setUsers((prev) => prev.filter((user) => user.id !== docId));
        showToast('error', err instanceof Error ? err.message : 'Error al crear usuario', 4000);
      }
    })();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
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

    const existing = users.find((u) => u.id === editingUserId);
    if (!existing) return;

    const avatarUrl = formData.avatarPreview || (formData.avatar instanceof File ? formData.avatarPreview : formData.avatar);
    const editedAt = new Date().toISOString();
    const userName = formData.name.trim();
    const userId = editingUserId;
    const rollbackSnapshot: PlatformUser = { ...existing };

    const patch: Partial<PlatformUser> = {
      name: userName,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() ? `+51 ${formData.phone.trim()}` : undefined,
      role: PLATFORM_USER_ROLE.Customer as PlatformUserRole,
      status: formData.status,
      avatar: typeof avatarUrl === 'string' && avatarUrl ? avatarUrl : undefined,
      address: formData.address.trim() || undefined,
      region: formData.region || undefined,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim() || undefined,
      editedAt,
    };

    const optimisticUser: PlatformUser = { ...existing, ...patch };

    const beforeSnapshot: Record<string, unknown> = {
      Nombre: existing.name,
      Email: existing.email,
      Teléfono: existing.phone || 'Sin teléfono',
      Rol: existing.role,
      Estado: existing.status,
      Avatar: existing.avatar ? 'Sí' : 'No',
      Dirección: existing.address || 'Sin dirección',
      Región: existing.region || 'Sin región',
      'Tipo documento': existing.documentType || 'Sin documento',
      'Número documento': existing.documentNumber || 'Sin número',
    };

    const afterSnapshot: Record<string, unknown> = {
      Nombre: userName,
      Email: patch.email,
      Teléfono: patch.phone || 'Sin teléfono',
      Rol: patch.role,
      Estado: patch.status,
      Avatar: patch.avatar ? 'Sí' : 'No',
      Dirección: patch.address || 'Sin dirección',
      Región: patch.region || 'Sin región',
      'Tipo documento': patch.documentType || 'Sin documento',
      'Número documento': patch.documentNumber || 'Sin número',
    };

    setPendingUserIds((prev) => new Set(prev).add(userId));
    setUsers((prev) => prev.map((user) => (user.id === userId ? optimisticUser : user)));

    handleCloseEditModal();
    showToast('success', `Cliente "${userName}" actualizado — sincronizando en segundo plano`, 2500);

    void (async () => {
      try {
        await application.platformUsers.update.execute({
          userId,
          patch,
          itemName: userName,
          beforeSnapshot,
          afterSnapshot,
          actorEmail: authUser?.email,
          actorName: authUser?.name,
        });
      } catch (err) {
        setUsers((prev) => prev.map((user) => (user.id === userId ? rollbackSnapshot : user)));
        setPendingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        showToast('error', err instanceof Error ? err.message : 'Error al actualizar usuario', 4000);
      }
    })();
  };

  const handleDeleteUser = async (user: PlatformUser) => {
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

    if (!result.isConfirmed) return;

    const rollbackUsers = users;
    deletingUserIdsRef.current.add(user.id);
    setUsers((prev) => prev.filter((item) => item.id !== user.id));
    showToast('success', `Cliente "${user.name}" eliminado — sincronizando en segundo plano`, 2500);

    void (async () => {
      try {
        await application.platformUsers.delete.execute({
          userId: user.id,
          itemName: user.name,
          actorEmail: authUser?.email,
          actorName: authUser?.name,
        });
      } catch (err) {
        deletingUserIdsRef.current.delete(user.id);
        setUsers(rollbackUsers);
        showToast('error', err instanceof Error ? err.message : 'Error al eliminar usuario', 4000);
      }
    })();
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

  const filteredUsers = useMemo(() => {
    const searchLower = deferredSearch.trim().toLowerCase();
    return clientUsers.filter((user) => {
      const matchesSearch =
        !searchLower ||
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
        (user.documentNumber && user.documentNumber.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clientUsers, deferredSearch, statusFilter]);

  const inactiveUsers = clientUsers.filter((user) => user.status === 'inactivo').length;
  const isSearching = searchTerm !== deferredSearch;
  const hasFilters = Boolean(deferredSearch.trim() || statusFilter !== 'all');

  if (error) {
    return (
      <div className="users-page">
        <UsersPageHeader
          Badge="Usuarios"
          Title="Centro de usuarios"
          Subtitle="No se pudo cargar la información."
          Icon={<IconUsers size={16} />}
        />
        <div className="users-panel-notice">{error}</div>
      </div>
    );
  }

  if (loading && users.length === 0 && activePanel === 'clients') {
    return (
      <div className="users-page">
        <UsersPageHeader
          Badge="Tienda · Clientes"
          Title="Gestión de clientes"
          Subtitle="Cargando clientes..."
          Icon={<IconUsers size={16} />}
          OnBack={() => setActivePanel('hub')}
        />
      </div>
    );
  }

  if (activePanel === 'hub') {
    return (
      <div className="users-page">
        <UsersHub
          OnSelectAdmins={() => setActivePanel('admins')}
          OnSelectClients={() => setActivePanel('clients')}
        />
      </div>
    );
  }

  if (activePanel === 'admins') {
    return <UsersAdminPanel OnBack={() => setActivePanel('hub')} />;
  }

  return (
    <div className="users-page users-page--clients">
      <UsersPageHeader
        Badge="Tienda · Clientes"
        Title="Gestión de clientes"
        Subtitle="Administra cuentas, accesos y datos de clientes de MEGA CEL."
        Icon={<IconUsers size={16} />}
        OnBack={() => setActivePanel('hub')}
        CtaLabel="Nuevo cliente"
        OnCtaClick={handleOpenModal}
      />

      <UsersKpiStrip
        Items={[
          {
            Label: 'Total clientes',
            Value: clientUsers.length,
            Meta: 'Registrados en la plataforma',
            Variant: 'primary',
          },
          {
            Label: 'Activos',
            Value: clientUsers.filter((user) => user.status === 'activo').length,
            Meta: 'Pueden acceder a la tienda',
            Variant: 'accent',
          },
          {
            Label: 'Inactivos',
            Value: inactiveUsers,
            Meta: 'Cuentas deshabilitadas',
            Variant: 'warn',
          },
          {
            Label: 'Mostrando',
            Value: filteredUsers.length,
            Meta: hasFilters ? 'Con filtros aplicados' : 'Listado completo',
            Variant: 'neutral',
          },
        ]}
      />

      <UsersCommandBar
        SearchQuery={searchTerm}
        OnSearchChange={setSearchTerm}
        OnClearSearch={() => setSearchTerm('')}
        IsSearching={isSearching}
        StatusFilter={statusFilter}
        OnStatusFilterChange={setStatusFilter}
        ViewMode={viewMode}
        OnViewModeChange={setViewMode}
        ResultCount={filteredUsers.length}
        SearchInputRef={searchInputRef}
      />

      {viewMode === 'table' ? (
        <UsersClientTableView
          Users={filteredUsers}
          PendingUserIds={pendingUserIds}
          FormatDateTime={formatDateTime}
          GetInitials={getInitials}
          OnEdit={handleOpenEditModal}
          OnDelete={handleDeleteUser}
          HasFilters={hasFilters}
        />
      ) : (
        <div className="users-grid">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <UsersClientCard
                key={user.id}
                User={user}
                Index={index}
                IsPending={pendingUserIds.has(user.id)}
                GetInitials={getInitials}
                OnEdit={handleOpenEditModal}
                OnDelete={handleDeleteUser}
              />
            ))
          ) : (
            <div className="users-empty users-empty--full">
              <span className="users-empty__icon" aria-hidden>👤</span>
              <h3>Sin resultados</h3>
              <p>No se encontraron clientes con los filtros seleccionados</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo cliente</h2>
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
                    <label htmlFor="password" className="form-label">
                      Contraseña <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <span className="form-hint">El cliente usará esta contraseña para iniciar sesión en la tienda</span>
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
                  Crear cliente
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
              <h2 className="modal-title">Editar cliente</h2>
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
