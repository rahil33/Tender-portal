import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen, AlertCircle } from 'lucide-react';
import { getPostBySlug, BlogPost } from '../../services/blogService';

const categoryLabels: Record<string, string> = {
  'gem-portal': 'GeM Portal',
  'tender-tips': 'Tender Tips',
  'certificates': 'Certificates',
  'training': 'Training',
  'industry-news': 'Industry News',
  'case-studies': 'Case Studies',
  'other': 'Other',
};

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Invalid article slug');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getPostBySlug(slug);
        setArticle(result.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Article not found');
        } else {
          setError(err.response?.data?.message || 'Failed to load article');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Article not found' ? 'Article Not Found' : 'Error Loading Article'}
            </h1>
            <p className="text-gray-600 mb-6">{error || 'Article not found'}</p>
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B3D91] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4">
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 text-[#0B3D91] hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Resources
        </Link>

        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {article.coverImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="px-4 py-2 bg-blue-50 text-[#0B3D91] font-semibold rounded-full">
                {categoryLabels[article.category] || article.category}
              </span>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span>{article.readTime} min read</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-[#0B3D91] mb-6">{article.title}</h1>

            <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0B3D91] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {article.author?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{article.author?.name || 'Admin'}</p>
                  <p className="text-sm text-gray-600">{article.author?.role || 'Editor'}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
                Share
              </button>
            </div>

            <div
              className="prose prose-lg max-w-none
                prose-headings:text-[#0B3D91] prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-ul:my-6 prose-li:text-gray-700 prose-li:mb-2
                prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        <div className="bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white text-[#0B3D91] rounded-full flex items-center justify-center font-bold text-2xl">
              {article.author?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-bold text-xl">{article.author?.name || 'Admin'}</p>
              <p className="opacity-90">{article.author?.role || 'Editor'}</p>
            </div>
          </div>
          <p className="mb-4 opacity-90">
            Expert in government procurement with over 15 years of experience helping businesses succeed in tender bidding.
          </p>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-white text-[#0B3D91] rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Get Expert Consultation
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={24} className="text-[#0B3D91]" />
            <h2 className="text-2xl font-bold text-[#0B3D91]">Related Articles</h2>
          </div>
          <div className="space-y-4">
            {article.relatedPosts && article.relatedPosts.length > 0 ? (
              article.relatedPosts.map((related, index) => (
                <Link
                  key={related._id || index}
                  to={`/resources/${related.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#0B3D91] transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#0B3D91] flex items-center justify-between">
                    {related.title}
                    <ArrowLeft size={20} className="text-gray-400 group-hover:text-[#0B3D91] rotate-180" />
                  </h3>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No related articles available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}