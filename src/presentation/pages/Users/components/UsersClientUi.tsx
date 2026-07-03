import { IconEdit, IconTrash } from '../../Brands/components/BrandIcons.tsx';

interface UserStatusBadgeProps {
  Status: string;
}

export const UserStatusBadge = ({ Status }: UserStatusBadgeProps) => {
  const IsActive = Status === 'activo';

  return (
    <span className={`user-status ${IsActive ? 'user-status--activo' : 'user-status--inactivo'}`}>
      <span className="user-status__dot" aria-hidden />
      {IsActive ? 'Activo' : 'Inactivo'}
    </span>
  );
};

export const UserPendingBadge = () => (
  <span className="user-pending-badge">
    <span className="user-pending-badge__spinner" aria-hidden />
    Guardando...
  </span>
);

interface UserClientActionButtonsProps {
  UserName: string;
  OnEdit: () => void;
  OnDelete: () => void;
  Disabled?: boolean;
  Layout?: 'inline' | 'card';
}

export const UserClientActionButtons = ({
  UserName,
  OnEdit,
  OnDelete,
  Disabled = false,
  Layout = 'inline',
}: UserClientActionButtonsProps) => (
  <div className={`users-action-group${Layout === 'card' ? ' users-action-group--card' : ''}`}>
    <button
      type="button"
      className="users-action-btn users-action-btn--edit"
      title="Editar cliente"
      aria-label={`Editar ${UserName}`}
      onClick={OnEdit}
      disabled={Disabled}
    >
      <IconEdit size={16} />
    </button>
    <button
      type="button"
      className="users-action-btn users-action-btn--delete"
      title="Eliminar cliente"
      aria-label={`Eliminar ${UserName}`}
      onClick={OnDelete}
      disabled={Disabled}
    >
      <IconTrash size={16} />
    </button>
  </div>
);
