import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { subscribeCollection } from '../../firebase/firestoreHelpers';
import { COLLECTIONS } from '../../firebase/collections';
import {
  addAdmin,
  isPrimaryAdmin,
  removeAdmin,
  togglePrimaryAdmin,
  type Admin,
} from '../../firebase/adminHelpers';

export const AdminManagementSection = () => {
  const { user } = useAuth();
  const [isUserPrimary, setIsUserPrimary] = useState(false);

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminIsPrimary, setNewAdminIsPrimary] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    isPrimaryAdmin(user.email).then(setIsUserPrimary).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!isUserPrimary) return;

    const unsubscribe = subscribeCollection<Admin>(
      COLLECTIONS.admins,
      (items) =>
        setAdmins(
          items.sort((a, b) => {
            if (a.isPrimary) return -1;
            if (b.isPrimary) return 1;
            return a.email.localeCompare(b.email);
          })
        ),
      (error) => console.error('Error loading admins:', error)
    );

    return () => unsubscribe();
  }, [isUserPrimary]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error('Email inválido');
      return;
    }

    if (!user) {
      toast.error('No estás autenticado');
      return;
    }

    setIsAddingAdmin(true);
    try {
      await addAdmin(newAdminEmail, newAdminName, user.email, newAdminIsPrimary);
      toast.success(
        `Administrador ${newAdminName} agregado correctamente${
          newAdminIsPrimary ? ' como principal' : ''
        }`
      );
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminIsPrimary(false);
    } catch (error: any) {
      toast.error(error?.message || 'Error al agregar administrador');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name} (${email}) como administrador?`)) {
      return;
    }

    try {
      await removeAdmin(email);
      toast.success(`Administrador ${name} eliminado correctamente`);
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar administrador');
    }
  };

  const handleTogglePrimary = async (email: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? 'quitar el estado de principal' : 'designar como principal';
    if (!confirm(`¿Estás seguro de ${action} a ${name} (${email})?`)) {
      return;
    }

    try {
      await togglePrimaryAdmin(email);
      toast.success(`${name} ${currentStatus ? 'ya no es' : 'ahora es'} administrador principal`);
    } catch (error: any) {
      toast.error(error?.message || 'Error al cambiar estado de administrador');
    }
  };

  if (!isUserPrimary) return null;

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Gestión de Administradores</h2>
      <p
        className="settings-section-description"
        style={{ marginBottom: '1.5rem', color: '#64748b' }}
      >
        Como administrador principal, puedes agregar, eliminar y designar otros administradores
        principales del sistema.
      </p>

      <form className="settings-form" onSubmit={handleAddAdmin} style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#1e293b',
          }}
        >
          Agregar Nuevo Administrador
        </h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              className="form-input"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
            <p className="form-hint" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              El administrador deberá iniciar sesión con Google usando este correo
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={newAdminIsPrimary}
              onChange={(e) => setNewAdminIsPrimary(e.target.checked)}
            />
            <span>Designar como Administrador Principal</span>
          </label>
          <p
            className="form-hint"
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', marginLeft: '1.75rem' }}
          >
            Los administradores principales pueden gestionar otros administradores
          </p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isAddingAdmin}>
          {isAddingAdmin ? 'Agregando...' : 'Agregar Administrador'}
        </button>
      </form>

      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>
          Administradores Actuales ({admins.length})
        </h3>
        <div className="admins-list">
          {admins.map((admin) => (
            <div key={admin.id} className="admin-item">
              <div className="admin-info">
                <div className="admin-header">
                  <span className="admin-name">{admin.name || admin.email}</span>
                  {admin.isPrimary && <span className="admin-badge-primary">Principal</span>}
                  {admin.email.toLowerCase() === 'amamanim@unamad.edu.pe' && (
                    <span
                      className="admin-badge-default"
                      title="Administrador por defecto - No se puede modificar ni eliminar"
                    >
                      Por Defecto
                    </span>
                  )}
                </div>
                <span className="admin-email">{admin.email}</span>
                {admin.createdAt && (
                  <span className="admin-date">
                    Agregado: {new Date(admin.createdAt).toLocaleDateString('es-PE')}
                    {admin.createdBy && ` por ${admin.createdBy}`}
                  </span>
                )}
              </div>
              <div className="admin-actions">
                <label className="admin-toggle-primary">
                  <input
                    type="checkbox"
                    checked={admin.isPrimary || false}
                    onChange={() =>
                      handleTogglePrimary(admin.email, admin.name || admin.email, admin.isPrimary || false)
                    }
                    disabled={
                      admin.email.toLowerCase() === user?.email?.toLowerCase() ||
                      admin.email.toLowerCase() === 'amamanim@unamad.edu.pe'
                    }
                  />
                  <span className="toggle-label">{admin.isPrimary ? 'Principal' : 'Hacer Principal'}</span>
                </label>
                <button
                  type="button"
                  className="btn btn-danger-small"
                  onClick={() => handleRemoveAdmin(admin.email, admin.name || admin.email)}
                  title="Eliminar administrador"
                  disabled={
                    admin.email.toLowerCase() === user?.email?.toLowerCase() ||
                    admin.email.toLowerCase() === 'amamanim@unamad.edu.pe'
                  }
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


