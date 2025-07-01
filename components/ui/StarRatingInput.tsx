import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  label: string;
  rating: number; // 0-5 (0 for unrated, 1-5 for selected)
  onRatingChange: (rating: number) => void;
  maxStars?: number;
  error?: string;
  id: string;
  required?: boolean;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  label,
  rating,
  onRatingChange,
  maxStars = 5,
  error,
  id,
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        id={id}
        className="flex items-center space-x-1"
        role="radiogroup"
        aria-label={label}
        aria-required={required}
      >
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              type="button"
              key={starValue}
              className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-colors ${
                starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
              }`}
              onClick={() => onRatingChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${starValue} de ${maxStars} estrelas`}
              role="radio"
              aria-checked={starValue === rating}
            >
              <Star
                size={28}
                className={starValue <= (hoverRating || rating) ? 'fill-current' : ''}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default StarRatingInput;