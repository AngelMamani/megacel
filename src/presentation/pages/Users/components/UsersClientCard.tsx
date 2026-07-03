import type { CSSProperties } from 'react';
import type { PlatformUser } from '../../../../domain/entities/PlatformUser.ts';
import { UserClientActionButtons, UserPendingBadge, UserStatusBadge } from './UsersClientUi.tsx';

interface UsersClientCardProps {
  User: PlatformUser;
  Index: number;
  IsPending: boolean;
  GetInitials: (name: string) => string;
  OnEdit: (user: PlatformUser) => void;
  OnDelete: (user: PlatformUser) => void;
}

export const UsersClientCard = ({
  User,
  Index,
  IsPending,
  GetInitials,
  OnEdit,
  OnDelete,
}: UsersClientCardProps) => (
  <article
    className={`users-client-card${IsPending ? ' users-client-card--pending' : ''}`}
    style={{ '--card-delay': `${Math.min(Index * 60, 480)}ms` } as CSSProperties}
  >
    <div className="users-client-card__header">
      {User.avatar ? (
        <img src={User.avatar} alt="" className="users-client-card__avatar users-client-card__avatar--img" />
      ) : (
        <span className="users-client-card__avatar">{GetInitials(User.name)}</span>
      )}
      <div className="users-client-card__head-text">
        <h3>{User.name}</h3>
        {User.code && <span className="users-client-card__code">{User.code}</span>}
      </div>
      <UserStatusBadge Status={User.status} />
    </div>

    <div className="users-client-card__body">
      <p className="users-client-card__email">{User.email}</p>
      {User.phone && <p className="users-client-card__phone">{User.phone}</p>}
      {User.region && <p className="users-client-card__region">{User.region}, Perú</p>}
      {IsPending && <UserPendingBadge />}
    </div>

    <div className="users-client-card__actions">
      <UserClientActionButtons
        UserName={User.name}
        OnEdit={() => OnEdit(User)}
        OnDelete={() => OnDelete(User)}
        Disabled={IsPending}
        Layout="card"
      />
    </div>
  </article>
);
