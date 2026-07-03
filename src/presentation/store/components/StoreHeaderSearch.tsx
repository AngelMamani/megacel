import { useTypingPlaceholder } from '../hooks/useTypingPlaceholder.ts';
import { StoreIconSearch } from './StoreIcons.tsx';

interface StoreHeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  autoFocus?: boolean;
}

export const StoreHeaderSearch = ({
  value,
  onChange,
  onSubmit,
  className = '',
  autoFocus = false,
}: StoreHeaderSearchProps) => {
  const AnimatedPlaceholder = useTypingPlaceholder(!value.trim());

  return (
    <form className={`store-header__search ${className}`.trim()} onSubmit={onSubmit}>
      <StoreIconSearch />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={AnimatedPlaceholder}
        aria-label="Buscar productos"
        autoFocus={autoFocus}
      />
    </form>
  );
};
