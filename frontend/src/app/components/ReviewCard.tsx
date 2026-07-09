import React, { useState } from 'react';
import { Star, ThumbsUp, MapPin, CheckCircle } from 'lucide-react';

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  verified: boolean;
  service: string;
  helpful: number;
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (id: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful }) => {
  const [markedHelpful, setMarkedHelpful] = useState(false);

  const handleHelpful = () => {
    if (!markedHelpful) {
      setMarkedHelpful(true);
      onHelpful?.(review.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{review.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{review.location}</span>
            {review.verified && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs">Verified</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < review.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <span className="font-medium text-gray-900">{review.service}</span> • {review.date}
        </div>
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1 text-xs transition-colors ${
            markedHelpful ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
          }`}
          disabled={markedHelpful}
        >
          <ThumbsUp className={`w-3 h-3 ${markedHelpful ? 'fill-gray-900' : ''}`} />
          <span>Helpful {markedHelpful ? `(${review.helpful + 1})` : `(${review.helpful})`}</span>
        </button>
      </div>
    </div>
  );
};
