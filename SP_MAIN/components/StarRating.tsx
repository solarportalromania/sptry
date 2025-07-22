
import React, { useState } from 'react';

const StarIcon = ({ filled, className }: { filled: boolean, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    className={className || "w-6 h-6"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.336.986l-4.048 3.735a.563.563 0 00-.182.523l1.14 5.438c.083.397-.431.714-.764.512l-4.76-2.927a.563.563 0 00-.576 0l-4.76 2.927c-.333.202-.847-.115-.764-.512l1.14-5.438a.563.563 0 00-.182-.523l-4.048-3.735c-.365-.323-.163-.946.336-.986l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);


interface StarRatingProps {
  rating: number;
  onRatingChange?: (newRating: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, className, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const isInteractive = !!onRatingChange;

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={`text-yellow-400 transition-colors duration-150 ${isInteractive ? 'cursor-pointer hover:text-yellow-300' : 'cursor-default'}`}
          onClick={() => isInteractive && onRatingChange(star)}
          onMouseEnter={() => isInteractive && setHoverRating(star)}
          onMouseLeave={() => isInteractive && setHoverRating(0)}
          disabled={!isInteractive}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <StarIcon
            filled={(hoverRating || rating) >= star}
            className={sizeClasses[size]}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
