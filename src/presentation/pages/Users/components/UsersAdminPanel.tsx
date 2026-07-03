import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useApplication, useInfrastructure } from '../../../providers/DependencyProvider.tsx';
import type { Admin } from '../../../../domain/entities/Admin.ts';
import { adminIdFromEmail } from '../../../../domain/services/AdminIdGenerator.ts';
import { normalizeEmail } from '../../../../domain/value-objects/Email.ts';
import { UserPendingBadge } from './UsersClientUi.tsx';
import { UsersPageHeader } from './UsersPageHeader.tsx';
import { UsersKpiStrip } from './UsersKpiStrip.tsx';
import { IconShield } from './UserIcons.tsx';
import '../Users.css';

interface UsersAdminPanelProps {
  OnBack: () => void;
}

export const UsersAdminPanel = ({ OnBack }: UsersAdminPanelProps) => {
  const { user } = useAuth();
  const { repositories } = useInfrastructure();
  const application = useApplication();

  const [isUserPrimary, setIsUserPrimary] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdminEmails, setPendingAdminEmails] = useState<Set<string>>(() => new Set());
  const optimisticAdminsRef = useRef<Map<string, Admin>>(new Map());
  const deletingAdminEmailsRef = useRef<Set<string>>(new Set());
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminIsPrimary, setNewAdminIsPrimary] = useState(false);

  useEffect(() => {
    if (!user) return;
    repositories.admin.isPrimaryAdmin(user.email).then(setIsUserPrimary).catch(console.error);
  }, [user, repositories.admin]);

  useEffect(() => {
    const unsubscribe = repositories.admin.subscribe(
      (items) => {
        const server = items.filter(
          (admin) => !deletingAdminEmailsRef.current.has(admin.email.toLowerCase())
        );
        const serverEmails = new Set(server.map((admin) => admin.email.toLowerCase()));

        serverEmails.forEach((email) => optimisticAdminsRef.current.delete(email));
        setPendingAdminEmails((prev) => {
          const next = new Set(prev);
          let changed = false;
          serverEmails.forEach((email) => {
            if (next.delete(email)) changed = true;
          });
          return changed ? next : prev;
        });

        deletingAdminEmailsRef.current.forEach((email) => {
          if (!serverEmails.has(email)) {
            deletingAdminEmailsRef.current.delete(email);
          }
        });

        const pending = Array.from(optimisticAdminsRef.current.values()).filter(
          (admin) => !serverEmails.has(admin.email.toLowerCase())
        );
        setAdmins([...pending, ...server]);
      },
      (error) => console.error('Error loading admins:', error)
    );
    return () => unsubscribe();
  }, [repositories.admin]);

  const primaryCount = admins.filter((admin) => admin.isPrimary).length;

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUserPrimary) {
      toast.error('Solo el administrador principal puede agregar administradores');
      return;
    }

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

    const email = normalizeEmail(newAdminEmail);
    const name = newAdminName.trim();
    const optimisticAdmin: Admin = {
      id: adminIdFromEmail(email),
      email,
      name,
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      isPrimary: newAdminIsPrimary,
    };

    optimisticAdminsRef.current.set(email, optimisticAdmin);
    setPendingAdminEmails((prev) => new Set(prev).add(email));
    setAdmins((prev) => [optimisticAdmin, ...prev.filter((admin) => admin.email !== email)]);

    setNewAdminEmail('');
    setNewAdminName('');
    setNewAdminIsPrimary(false);
    toast.success(`Administrador ${name} agregado — sincronizando en segundo plano`);

    void (async () => {
      try {
        await application.admins.add.execute({
          email,
          name,
          createdBy: user.email,
          isPrimary: newAdminIsPrimary,
        });
      } catch (error: unknown) {
        optimisticAdminsRef.current.delete(email);
        setPendingAdminEmails((prev) => {
          const next = new Set(prev);
          next.delete(email);
          return next;
        });
        setAdmins((prev) => prev.filter((admin) => admin.email !== email));
        toast.error(error instanceof Error ? error.message : 'Error al agregar administrador');
      }
    })();
  };

  const handleRemoveAdmin = (email: string, name: string) => {
    if (!isUserPrimary) return;
    if (!confirm(`¿Eliminar a ${name} (${email}) como administrador?`)) return;

    const normalizedEmail = email.toLowerCase();
    const rollbackAdmins = admins;
    deletingAdminEmailsRef.current.add(normalizedEmail);
    setAdmins((prev) => prev.filter((admin) => admin.email.toLowerCase() !== normalizedEmail));
    toast.success(`Administrador ${name} eliminado — sincronizando en segundo plano`);

    void (async () => {
      try {
        await application.admins.remove.execute({ email });
      } catch (error: unknown) {
        deletingAdminEmailsRef.current.delete(normalizedEmail);
        setAdmins(rollbackAdmins);
        toast.error(error instanceof Error ? error.message : 'Error al eliminar administrador');
      }
    })();
  };

  const handleTogglePrimary = (email: string, name: string, currentStatus: boolean) => {
    if (!isUserPrimary) return;
    const action = currentStatus ? 'quitar el estado de principal' : 'designar como principal';
    if (!confirm(`¿${action} a ${name} (${email})?`)) return;

    const normalizedEmail = email.toLowerCase();
    const rollbackAdmins = admins;
    setPendingAdminEmails((prev) => new Set(prev).add(normalizedEmail));
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.email.toLowerCase() === normalizedEmail
          ? { ...admin, isPrimary: !currentStatus }
          : admin
      )
    );
    toast.success(`${name} actualizado — sincronizando en segundo plano`);

    void (async () => {
      try {
        await application.admins.togglePrimary.execute({ email });
      } catch (error: unknown) {
        setAdmins(rollbackAdmins);
        setPendingAdminEmails((prev) => {
          const next = new Set(prev);
          next.delete(normalizedEmail);
          return next;
        });
        toast.error(error instanceof Error ? error.message : 'Error al cambiar estado');
      }
    })();
  };

  return (
    <div className="users-page">
      <UsersPageHeader
        Badge="Panel · Administradores"
        Title="Gestión de administradores"
        Subtitle="Controla quién puede acceder al panel administrativo de MEGA CEL con Google."
        Icon={<IconShield size={16} />}
        OnBack={OnBack}
      />

      <UsersKpiStrip
        Items={[
          {
            Label: 'Administradores',
            Value: admins.length,
            Meta: 'Con acceso al panel',
            Variant: 'primary',
          },
          {
            Label: 'Principales',
            Value: primaryCount,
            Meta: 'Pueden gestionar el equipo',
            Variant: 'accent',
          },
          {
            Label: 'Tu rol',
            Value: isUserPrimary ? 'Principal' : 'Admin',
            Meta: isUserPrimary ? 'Puedes agregar y eliminar' : 'Solo lectura de equipo',
            Variant: 'neutral',
          },
          {
            Label: 'Acceso',
            Value: 'Google',
            Meta: 'Inicio con correo autorizado',
            Variant: 'warn',
          },
        ]}
      />

      {!isUserPrimary && (
        <div className="users-panel-notice">
          Solo el administrador principal puede agregar, eliminar o cambiar roles de administradores.
        </div>
      )}

      {isUserPrimary && (
        <form className="users-admin-form" onSubmit={handleAddAdmin}>
          <h2>Agregar administrador</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-name">
                Nombre completo
              </label>
              <input
                id="admin-name"
                type="text"
                className="form-input"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                Correo electrónico
              </label>
              <input
                id="admin-email"
                type="email"
                className="form-input"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
              />
              <p className="form-hint">Debe iniciar sesión con Google usando este correo.</p>
            </div>
          </div>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={newAdminIsPrimary}
              onChange={(e) => setNewAdminIsPrimary(e.target.checked)}
            />
            <span>Designar como administrador principal</span>
          </label>
          <button type="submit" className="btn-primary">
            Agregar administrador
          </button>
        </form>
      )}

      <section>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--up-text)' }}>
          Administradores actuales ({admins.length})
        </h2>
        <div className="users-admin-grid">
          {admins.map((admin) => {
            const isPending = pendingAdminEmails.has(admin.email.toLowerCase());
            const isSelf = admin.email.toLowerCase() === user?.email?.toLowerCase();
            return (
              <article
                key={admin.id}
                className={`users-admin-card${isPending ? ' users-admin-card--pending' : ''}`}
              >
                <div className="users-admin-card__header">
                  <div>
                    <span className="users-admin-card__name">{admin.name || admin.email}</span>
                    {isPending && <UserPendingBadge />}
                  </div>
                  {admin.isPrimary && <span className="users-admin-card__badge">Principal</span>}
                </div>
                <span className="users-admin-card__email">{admin.email}</span>
                {admin.createdAt && (
                  <span className="users-admin-card__date">
                    Agregado: {new Date(admin.createdAt).toLocaleDateString('es-PE')}
                  </span>
                )}
                {isUserPrimary && (
                  <div className="users-admin-card__actions">
                    <label className="users-admin-toggle">
                      <input
                        type="checkbox"
                        checked={admin.isPrimary || false}
                        onChange={() =>
                          handleTogglePrimary(
                            admin.email,
                            admin.name || admin.email,
                            admin.isPrimary || false
                          )
                        }
                        disabled={isPending || isSelf}
                      />
                      <span>{admin.isPrimary ? 'Principal' : 'Hacer principal'}</span>
                    </label>
                    <button
                      type="button"
                      className="users-btn--danger"
                      onClick={() => handleRemoveAdmin(admin.email, admin.name || admin.email)}
                      disabled={isPending || isSelf}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
