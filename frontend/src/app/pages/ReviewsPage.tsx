import React, { useState } from 'react';
import { Star, Filter, Search, TrendingUp, CheckCircle, ThumbsUp, MapPin, Send } from 'lucide-react';

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

const reviews: Review[] = [
  { id: '1', name: 'Rajesh Kumar', location: 'Ahmedabad, Gujarat', rating: 5, title: 'Excellent GeM registration support', text: 'The team at Phoenix Tender Tech provided outstanding support for our GeM registration. They handled all documentation efficiently and kept us informed throughout. Highly professional and knowledgeable — would definitely recommend.', date: '2026-03-15', verified: true, service: 'GeM Registration', helpful: 12 },
  { id: '2', name: 'Priya Sharma', location: 'Mumbai, Maharashtra', rating: 5, title: 'Professional training exceeded expectations', text: 'I enrolled in the professional training program and it was worth every penny. The instructors are experts, and the WhatsApp support made learning convenient. The bidding module helped me win my first tender. Great investment.', date: '2026-03-10', verified: true, service: 'Professional Training', helpful: 18 },
  { id: '3', name: 'Amit Patel', location: 'Surat, Gujarat', rating: 5, title: 'Best tender consultancy in Gujarat', text: 'We have been working with Phoenix Tender Tech for over 6 months. Their expertise in tender bidding has helped us secure multiple government contracts. Responsive, professional, and truly understands procurement.', date: '2026-03-05', verified: true, service: 'Tender Bidding', helpful: 15 },
  { id: '4', name: 'Sneha Desai', location: 'Vadodara, Gujarat', rating: 4, title: 'Good service, quick response', text: 'The vendor registration process was smooth and completed within the promised timeframe. The team was helpful in clarifying all our doubts. Minor improvement needed in follow-up communication, but overall very satisfied.', date: '2026-02-28', verified: true, service: 'Vendor Registration', helpful: 8 },
  { id: '5', name: 'Vijay Singh', location: 'Delhi, NCR', rating: 5, title: 'Outstanding compliance support', text: 'Phoenix Tender Tech helped us maintain all compliance requirements for government contracts. Their ISO certifications give us confidence in their quality. The digital signature feature is particularly useful for quick tender submissions.', date: '2026-02-20', verified: true, service: 'Compliance Services', helpful: 10 },
  { id: '6', name: 'Meera Shah', location: 'Rajkot, Gujarat', rating: 5, title: 'WhatsApp training is a game-changer', text: 'The WhatsApp training delivery is incredible. I could learn during my commute and instructors were always available. The product upload training helped me set up my catalog correctly on the first try. Highly recommend.', date: '2026-02-15', verified: true, service: 'Professional Training', helpful: 22 },
];

/* ── Review Card ─────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const [marked, setMarked] = useState(false);
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
              {review.verified && (
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
          <span className="font-medium text-gray-600">{review.service}</span> · {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <button onClick={() => !marked && setMarked(true)}
          disabled={marked}
          className={`flex items-center gap-1.5 text-xs transition-colors ${marked ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
          <ThumbsUp size={12} className={marked ? 'fill-gray-900' : ''} />
          Helpful ({marked ? review.helpful + 1 : review.helpful})
        </button>
      </div>
    </div>
  );
}

/* ── Review Form ─────────────────────────────────── */
function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

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
    <form onSubmit={(e) => { e.preventDefault(); if (rating) setSubmitted(true); }}
      className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Write a Review</h3>
        <p className="text-sm text-gray-400">Share your experience with our services</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Name *</label>
          <input type="text" required placeholder="Full name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email *</label>
          <input type="email" required placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Used *</label>
        <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none">
          <option value="">Select a service</option>
          {['GeM Registration', 'Tender Bidding', 'Professional Training', 'Vendor Registration', 'Compliance Services'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Rating *</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} type="button"
              onClick={() => setRating(r)}
              onMouseEnter={() => setHovered(r)}
              onMouseLeave={() => setHovered(0)}
              className="hover:scale-110 transition-transform">
              <Star size={28} className={r <= (hovered || rating) ? 'fill-gray-900 text-gray-900' : 'text-gray-200'} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Title *</label>
        <input type="text" required placeholder="Summarise your experience" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Review *</label>
        <textarea required rows={4} minLength={50} placeholder="Share your experience in detail (min 50 characters)…"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none placeholder:text-gray-300" />
      </div>
      <div className="flex items-start gap-3">
        <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded border-gray-300 accent-gray-900" />
        <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
          I confirm this review is based on my genuine experience. I understand reviews are moderated before publication.
        </label>
      </div>
      <button type="submit" className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
        <Send size={15} /> Submit Review
      </button>
      <p className="text-xs text-center text-gray-400">Reviews are published within 24–48 hours after verification.</p>
    </form>
  );
}

/* ── Page ─────────────────────────────────────────── */
export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const [sort, setSort] = useState('recent');

  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    pct: (reviews.filter((r) => r.rating === s).length / reviews.length) * 100,
  }));

  const filtered = [...reviews]
    .filter((r) => {
      const q = search.toLowerCase();
      return (!q || r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q))
        && (service === 'all' || r.service === service);
    })
    .sort((a, b) =>
      sort === 'recent' ? new Date(b.date).getTime() - new Date(a.date).getTime()
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
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{reviews.length}+</div>
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
            <input type="text" placeholder="Search reviews…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <select value={service} onChange={(e) => setService(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none">
              <option value="all">All Services</option>
              {['GeM Registration', 'Tender Bidding', 'Professional Training', 'Vendor Registration', 'Compliance Services'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16">
          {filtered.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>

        {/* Write a review */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Share Your Experience</h2>
            <p className="text-gray-400 text-sm mt-2">Your feedback helps other businesses make informed decisions.</p>
          </div>
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
