import type { CSSProperties, MouseEvent } from 'react';
import type { PlatformUser } from '../../../../domain/entities/PlatformUser.ts';
import { UserClientActionButtons, UserPendingBadge, UserStatusBadge } from './UsersClientUi.tsx';

interface UsersClientTableViewProps {
  Users: PlatformUser[];
  PendingUserIds: Set<string>;
  FormatDateTime: (date?: string) => string;
  GetInitials: (name: string) => string;
  OnEdit: (user: PlatformUser) => void;
  OnDelete: (user: PlatformUser) => void;
  HasFilters: boolean;
}

export const UsersClientTableView = ({
  Users,
  PendingUserIds,
  FormatDateTime,
  GetInitials,
  OnEdit,
  OnDelete,
  HasFilters,
}: UsersClientTableViewProps) => {
  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="users-table-shell">
      <table className="users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Contacto</th>
            <th>Documento</th>
            <th>Estado</th>
            <th>Último acceso</th>
            <th>Registro</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {Users.length > 0 ? (
            Users.map((user, index) => {
              const isPending = PendingUserIds.has(user.id);
              return (
                <tr
                  key={user.id}
                  className={[
                    isPending ? 'users-table__row--pending' : '',
                    'users-table__row--interactive',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ '--row-delay': `${Math.min(index * 40, 320)}ms` } as CSSProperties}
                >
                  <td>
                    <div className="users-table__user">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="users-table__avatar users-table__avatar--img" />
                      ) : (
                        <span className="users-table__avatar">{GetInitials(user.name)}</span>
                      )}
                      <div>
                        <strong>{user.name}</strong>
                        <span className="users-table__email">{user.email}</span>
                        {user.code && <span className="users-table__code">Código: {user.code}</span>}
                        {isPending && <UserPendingBadge />}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="users-table__contact">
                      {user.phone && <span>{user.phone}</span>}
                      {user.region && <span className="users-table__muted">{user.region}</span>}
                    </div>
                  </td>
                  <td>
                    {user.documentNumber ? (
                      <div className="users-table__doc">
                        <span className="users-table__doc-type">{user.documentType}</span>
                        <span>{user.documentNumber}</span>
                      </div>
                    ) : (
                      <span className="users-table__muted">Sin documento</span>
                    )}
                  </td>
                  <td>
                    <UserStatusBadge Status={user.status} />
                  </td>
                  <td>{user.lastLogin ? FormatDateTime(user.lastLogin) : 'Nunca'}</td>
                  <td>
                    <span>{FormatDateTime(user.createdAt || user.editedAt)}</span>
                    {user.editedAt && user.createdAt && user.editedAt !== user.createdAt && (
                      <span className="users-table__muted">Editado: {FormatDateTime(user.editedAt)}</span>
                    )}
                  </td>
                  <td onClick={StopActions}>
                    <UserClientActionButtons
                      UserName={user.name}
                      OnEdit={() => OnEdit(user)}
                      OnDelete={() => OnDelete(user)}
                      Disabled={isPending}
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7}>
                <div className="users-empty">
                  <span className="users-empty__icon" aria-hidden>👤</span>
                  <h3>Sin resultados</h3>
                  <p>
                    {HasFilters
                      ? 'No hay clientes que coincidan con los filtros.'
                      : 'Aún no hay clientes registrados.'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
