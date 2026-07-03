import { Link } from 'react-router-dom';
import type { Product } from '../../../domain/entities/Product.ts';
import { BuildStoreProductPath } from '../utils/storePresentationUtils.ts';

type WashiTapeTone = 'pink' | 'cyan' | 'blue';

interface StoreNewArrivalCardProps {
  Product: Product;
  TapeTone?: WashiTapeTone;
}

const TAPE_TONES: WashiTapeTone[] = ['pink', 'cyan', 'blue'];

export const StoreNewArrivalCard = ({ Product, TapeTone = 'pink' }: StoreNewArrivalCardProps) => {
  const image = Product.images?.[0];
  const tone = TAPE_TONES.includes(TapeTone) ? TapeTone : 'pink';

  return (
    <Link to={BuildStoreProductPath(Product.id)} className="store-new-arrival-card" aria-label={`Ver ${Product.name}`}>
      <div className="store-new-arrival-card__image-wrapper">
        <div
          className={`store-new-arrival-card__washi-tape store-new-arrival-card__washi-tape--${tone}`}
          aria-hidden
        />
        <div className="store-new-arrival-card__image-inner">
          {image ? (
            <img src={image} alt={Product.name} loading="lazy" />
          ) : (
            <span className="store-new-arrival-card__placeholder">{Product.name.charAt(0)}</span>
          )}
        </div>
      </div>
      <h3 className="store-new-arrival-card__name">{Product.name}</h3>
    </Link>
  );
};

export const GetNewArrivalTapeTone = (index: number): WashiTapeTone => TAPE_TONES[index % TAPE_TONES.length];
