import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';

interface ReviewFormProps {
  onSubmit?: (review: ReviewFormData) => void;
}

export interface ReviewFormData {
  name: string;
  email: string;
  service: string;
  rating: number;
  title: string;
  text: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    email: '',
    service: '',
    rating: 0,
    title: '',
    text: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!agreedToTerms) {
      alert('Please agree to the terms');
      return;
    }
    onSubmit?.(formData);
    setSubmitted(true);
    // Reset form
    setTimeout(() => {
      setFormData({ name: '', email: '', service: '', rating: 0, title: '', text: '' });
      setAgreedToTerms(false);
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Send className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You for Your Review!</h3>
        <p className="text-gray-500">Your review will be published after verification.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h3>
        <p className="text-sm text-gray-500">Share your experience with our services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Service Used *</label>
        <select
          required
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none"
        >
          <option value="">Select a service</option>
          <option value="GeM Registration">GeM Registration</option>
          <option value="Tender Bidding">Tender Bidding</option>
          <option value="Professional Training">Professional Training</option>
          <option value="Vendor Registration">Vendor Registration</option>
          <option value="Compliance Services">Compliance Services</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData({ ...formData, rating })}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= (hoveredRating || formData.rating)
                    ? 'fill-gray-900 text-gray-900'
                    : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Review Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="Summarize your experience"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Your Review *</label>
        <textarea
          required
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
          placeholder="Share details of your experience (minimum 50 characters)"
          minLength={50}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
          I agree that this review is based on my own experience and is my genuine opinion. I understand that reviews are moderated before publication.
        </label>
      </div>

      <button
        type="submit"
        className="w-full px-6 py-4 rounded-xl font-medium transition-all bg-gray-900 text-white hover:bg-gray-800 shadow-sm flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Submit Review
      </button>

      <p className="text-xs text-center text-gray-500">
        Your review will be published after verification (usually within 24-48 hours)
      </p>
    </form>
  );
};
