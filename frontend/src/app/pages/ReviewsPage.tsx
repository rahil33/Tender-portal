import React, { useState, useEffect } from 'react';
import { Star, Filter, Search, TrendingUp, CheckCircle, ThumbsUp, MapPin, Send } from 'lucide-react';
import api from '../../services/api';

export interface Review {
  _id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  status: string;
  isVerified: boolean;
  service: string;
  helpful: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: { _id: number; count: number }[];
  serviceBreakdown: { _id: string; count: number }[];
}

/* ── Review Card ─────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const [marked, setMarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);

  const handleHelpful = async () => {
    if (marked) return;
    try {
      await api.post(`/reviews/${review._id}/vote`, { vote: 'helpful' });
      setHelpfulCount(prev => prev + 1);
      setMarked(true);
    } catch (error) {
      console.error('Failed to mark review as helpful', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
            {review.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{review.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <MapPin size={11} />{review.location}
              {review.isVerified && (
                <><span>·</span><span className="flex items-center gap-1 text-green-600"><CheckCircle size={11} /> Verified</span></>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} className={i < review.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-200'} />
          ))}
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{review.title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{review.text}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-600">{review.service}</span> · {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <button onClick={handleHelpful}
          disabled={marked}
          className={`flex items-center gap-1.5 text-xs transition-colors ${marked ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
          <ThumbsUp size={12} className={marked ? 'fill-gray-900' : ''} />
          Helpful ({helpfulCount})
        </button>
      </div>
    </div>
  );
}

/* ── Review Form ─────────────────────────────────── */
function ReviewForm({ onReviewSubmitted }: { onReviewSubmitted: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!agree) {
      setError('Please agree to the terms');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/reviews', {
        name,
        email,
        service,
        rating,
        title,
        text,
        location: location || 'India',
      });
      
      setSubmitted(true);
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
      console.error('Review submission error', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5">
          <Send size={22} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Thank You!</h3>
        <p className="text-gray-500 text-sm">Your review will be published after verification — usually within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Write a Review</h3>
        <p className="text-sm text-gray-400">Share your experience with our services</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Name *</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name" 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email *</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Used *</label>
          <select 
            required 
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none"
          >
            <option value="">Select a service</option>
            {['GeM Registration', 'Tender Bidding', 'Professional Training', 'Vendor Registration', 'Compliance Services'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location (Optional)</label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State" 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Rating *</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((r) => (
            <button 
              key={r} 
              type="button"
              onClick={() => setRating(r)}
              onMouseEnter={() => setHovered(r)}
              onMouseLeave={() => setHovered(0)}
              className="hover:scale-110 transition-transform"
            >
              <Star size={28} className={r <= (hovered || rating) ? 'fill-gray-900 text-gray-900' : 'text-gray-200'} />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Title *</label>
        <input 
          type="text" 
          required 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience" 
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" 
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Review *</label>
        <textarea 
          required 
          rows={4} 
          minLength={50}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience in detail (min 50 characters)…"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none placeholder:text-gray-300" 
        />
      </div>
      
      <div className="flex items-start gap-3">
        <input 
          type="checkbox" 
          id="terms" 
          required 
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 accent-gray-900" 
        />
        <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
          I confirm this review is based on my genuine experience. I understand reviews are moderated before publication.
        </label>
      </div>
      
      <button 
        type="submit" 
        disabled={submitting}
        className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
      <p className="text-xs text-center text-gray-400">Reviews are published within 24–48 hours after verification.</p>
    </form>
  );
}

/* ── Page ─────────────────────────────────────────── */
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const [sort, setSort] = useState('recent');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        api.get('/reviews?limit=50&status=approved'),
        api.get('/reviews/stats'),
      ]);
      
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data);
      }
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const avg = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;
  
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const item = stats?.ratingBreakdown?.find((b) => b._id === star);
    const count = item?.count || 0;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, pct };
  });

  const filtered = [...reviews]
    .filter((r) => {
      const q = search.toLowerCase();
      return (!q || r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
        && (service === 'all' || r.service === service);
    })
    .sort((a, b) =>
      sort === 'recent' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : sort === 'highest' ? b.rating - a.rating
        : sort === 'lowest' ? a.rating - b.rating
        : b.helpful - a.helpful
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
            Client Reviews
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-[1.1]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            What Our Clients Say
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Real feedback from businesses that have grown through Phoenix Tender Tech's services.
          </p>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-16">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-7 text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{avg.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(avg) ? 'fill-gray-900 text-gray-900' : 'text-gray-200'} />)}
            </div>
            <p className="text-sm text-gray-400">Average Rating</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7 text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalReviews}+</div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <TrendingUp size={15} /> Total Verified Reviews
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Rating Breakdown</h3>
            {breakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-400 w-5">{star}★</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input 
              type="text" 
              placeholder="Search reviews…" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" 
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <select 
              value={service} 
              onChange={(e) => setService(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none"
            >
              <option value="all">All Services</option>
              {['GeM Registration', 'Tender Bidding', 'Professional Training', 'Vendor Registration', 'Compliance Services'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16">
            {filtered.map((r) => <ReviewCard key={r._id} review={r} />)}
          </div>
        ) : (
          <div className="text-center py-12 mb-16">
            <p className="text-gray-400 text-sm">No reviews found. Be the first to share your experience!</p>
          </div>
        )}

        {/* Write a review */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Share Your Experience</h2>
            <p className="text-gray-400 text-sm mt-2">Your feedback helps other businesses make informed decisions.</p>
          </div>
          <ReviewForm onReviewSubmitted={fetchReviews} />
        </div>
      </div>
    </div>
  );
}