import React from 'react';
import { Link } from 'react-router';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

const blogPosts = [
  {
    slug: 'gem-registration-guide',
    title: 'Complete Guide to GeM Registration in 2026',
    excerpt: 'Step-by-step guide to register your business on the Government e-Marketplace portal and start selling to government departments.',
    category: 'GeM Portal',
    author: 'Rajesh Sharma',
    date: 'March 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    slug: 'tender-bidding-tips',
    title: '10 Essential Tips for Winning Government Tenders',
    excerpt: 'Learn the proven strategies and best practices that can significantly improve your chances of winning government contracts.',
    category: 'Tender Tips',
    author: 'Priya Patel',
    date: 'March 18, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    slug: 'oem-authorization-process',
    title: 'Understanding OEM Authorization on GeM',
    excerpt: 'Everything you need to know about becoming an authorized OEM on the GeM platform and managing your reseller network.',
    category: 'GeM Portal',
    author: 'Amit Kumar',
    date: 'March 15, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    slug: 'msme-certificates-guide',
    title: 'MSME Certificates: Types and Benefits',
    excerpt: 'Comprehensive guide to different types of MSME certificates and how they can help you win more government tenders.',
    category: 'Certificates',
    author: 'Rajesh Sharma',
    date: 'March 12, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    slug: 'iso-certification-importance',
    title: 'Why ISO Certification Matters for Tender Success',
    excerpt: 'Discover how ISO certifications can enhance your credibility and open doors to high-value government contracts.',
    category: 'Certificates',
    author: 'Priya Patel',
    date: 'March 10, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    slug: 'tender-documentation-checklist',
    title: 'Essential Documentation Checklist for Tender Submission',
    excerpt: 'Never miss a required document again with our comprehensive checklist for tender bid submissions.',
    category: 'Tender Tips',
    author: 'Amit Kumar',
    date: 'March 8, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

const categories = ['All', 'GeM Portal', 'Tender Tips', 'Certificates'];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

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
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link 
              key={post.slug}
              to={`/resources/${post.slug}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-[#0B3D91] text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
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
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[#0B3D91] font-semibold group-hover:gap-3 transition-all">
                  Read More <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white rounded-xl p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Get the latest tender alerts, expert tips, and industry insights delivered straight to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input 
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-[#0B3D91] rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
