import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Calendar, User, ArrowRight, BookOpen, Mail, Send, CheckCircle } from 'lucide-react';
import { getAllPosts, subscribeToNewsletter, BlogPost } from '../../services/blogService';
import { toast } from 'sonner';

const categories = ['All', 'gem-portal', 'tender-tips', 'certificates'];

const categoryLabels: Record<string, string> = {
  'gem-portal': 'GeM Portal',
  'tender-tips': 'Tender Tips',
  'certificates': 'Certificates',
  'training': 'Training',
  'industry-news': 'Industry News',
  'case-studies': 'Case Studies',
  'other': 'Other',
};

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoryFilter = selectedCategory === 'All' ? undefined : selectedCategory;
        const result = await getAllPosts(1, 100, { category: categoryFilter });
        setBlogPosts(result.data.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load blog posts');
        toast.error('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);

    try {
      const result = await subscribeToNewsletter(newsletterEmail, 'website');
      setNewsletterSubmitted(true);
      toast.success(result.message || 'Successfully subscribed to newsletter!');
      setNewsletterEmail('');
      setTimeout(() => {
        setNewsletterSubmitted(false);
      }, 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(errorMessage);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0B3D91] mb-4">Resources & Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights, guides, and tips on government tenders, GeM portal, and business certifications.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-[#0B3D91] text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {categoryLabels[category] || category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0B3D91] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading blog posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#0B3D91] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && !error && blogPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium mb-4">No blog posts available yet.</p>
            <p className="text-gray-500 text-sm">Check back later for new content.</p>
          </div>
        )}

        {!loading && !error && blogPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link 
                key={post._id}
                to={`/resources/${post.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all"
              >
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-[#0B3D91] text-xs font-semibold rounded-full">
                      {categoryLabels[post.category] || post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.readTime} min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0B3D91] mb-3 group-hover:text-[#1e5bb8] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{post.author?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[#0B3D91] font-semibold group-hover:gap-3 transition-all">
                    Read More <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white rounded-xl p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Get the latest tender alerts, expert tips, and industry insights delivered straight to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-3">
            <input 
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={newsletterLoading || newsletterSubmitted}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
            <button 
              type="submit"
              disabled={newsletterLoading || newsletterSubmitted}
              className="px-8 py-3 bg-white text-[#0B3D91] rounded-lg font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {newsletterLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : newsletterSubmitted ? (
                <>
                  <CheckCircle size={18} />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
