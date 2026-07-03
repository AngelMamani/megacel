import { useId } from 'react';

interface StoreStarRatingProps {
  Rating: number;
  Size?: 'sm' | 'md';
  Label?: string;
}

export const StoreStarRating = ({ Rating, Size = 'md', Label }: StoreStarRatingProps) => {
  const GradientId = useId();
  const SafeRating = Math.min(5, Math.max(0, Rating));
  const FullStars = Math.floor(SafeRating);
  const HasHalf = SafeRating - FullStars >= 0.5;

  return (
    <span
      className={`store-star-rating store-star-rating--${Size}`}
      role="img"
      aria-label={Label ?? `${SafeRating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const IsFull = index < FullStars;
        const IsHalf = !IsFull && HasHalf && index === FullStars;
        const HalfGradientId = `${GradientId}-half-${index}`;

        return (
          <svg key={`star-${index}`} viewBox="0 0 24 24" focusable="false" aria-hidden>
            {IsHalf ? (
              <>
                <defs>
                  <linearGradient id={HalfGradientId}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l2.9 8.9H24l-7.5 5.5 2.9 8.9L12 19.8l-7.4 4.5 2.9-8.9L0 10.9h9.1L12 2z"
                  fill={`url(#${HalfGradientId})`}
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </>
            ) : (
              <path
                d="M12 2l2.9 8.9H24l-7.5 5.5 2.9 8.9L12 19.8l-7.4 4.5 2.9-8.9L0 10.9h9.1L12 2z"
                fill={IsFull ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={IsFull ? 0 : 1}
                opacity={IsFull ? 1 : 0.28}
              />
            )}
          </svg>
        );
      })}
    </span>
  );
};
