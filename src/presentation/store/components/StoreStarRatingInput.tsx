import { useId, useState } from 'react';
import './StoreStarRatingInput.css';

interface StoreStarRatingInputProps {
  Value: number;
  OnChange: (rating: number) => void;
  Size?: 'sm' | 'md' | 'lg';
  Label?: string;
}

export const StoreStarRatingInput = ({
  Value,
  OnChange,
  Size = 'lg',
  Label = 'Selecciona tu calificación',
}: StoreStarRatingInputProps) => {
  const GroupName = useId();
  const [HoverRating, setHoverRating] = useState(0);
  const DisplayRating = HoverRating || Value;

  return (
    <div className={`store-star-rating-input store-star-rating-input--${Size}`}>
      <span className="store-star-rating-input__label">{Label}</span>
      <div
        className="store-star-rating-input__stars"
        role="radiogroup"
        aria-label={Label}
        onMouseLeave={() => setHoverRating(0)}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const StarValue = index + 1;
          const IsActive = StarValue <= DisplayRating;

          return (
            <label key={StarValue} className="store-star-rating-input__star">
              <input
                type="radio"
                name={GroupName}
                value={StarValue}
                checked={Value === StarValue}
                onChange={() => OnChange(StarValue)}
                onMouseEnter={() => setHoverRating(StarValue)}
              />
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
                <path
                  d="M12 2l2.9 8.9H24l-7.5 5.5 2.9 8.9L12 19.8l-7.4 4.5 2.9-8.9L0 10.9h9.1L12 2z"
                  fill={IsActive ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={IsActive ? 0 : 1}
                />
              </svg>
            </label>
          );
        })}
      </div>
    </div>
  );
};
