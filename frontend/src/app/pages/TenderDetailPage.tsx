import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Calendar, MapPin, Building2, FileText, Clock, ArrowLeft, ExternalLink, Download, CheckCircle } from 'lucide-react';
import { tenderService, Tender } from '../../services/tenderService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner, Skeleton } from '../../components/Loading';
import { useNotification } from '../../contexts/NotificationContext';

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { error: showError, success } = useNotification();
  
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTender = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await tenderService.getTenderById(id);
        setTender(response.data);
      } catch (err: any) {
        console.error('Failed to fetch tender:', err);
        const message = err.response?.data?.message || 'Failed to load tender details';
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTender();
  }, [id, showError]);

  const handleApply = () => {
    if (!isAuthenticated) {
      showError('Please login to apply for this tender');
      navigate('/');
      return;
    }
    // TODO: Implement bid submission flow
    success('Application started', 'You will be redirected to the bid submission form');
  };

  if (loading) {
    return (
      <div className="py-12 bg-background min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-6">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="py-12 bg-background min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tender Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This tender does not exist or has been removed.'}</p>
            <Link 
              to="/tenders"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Browse All Tenders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/tenders"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Tenders
        </Link>

        {/* Tender Header */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{tender.title}</h1>
              <p className="text-muted-foreground">Reference No: {tender.tenderNumber}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
              tender.status === 'published' ? 'bg-green-100 text-green-700' :
              tender.status === 'closed' ? 'bg-gray-100 text-gray-700' :
              tender.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
            </span>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Authority</p>
                <p className="font-semibold">{tender.issuingOrganization || 'Government of India'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{tender.location || 'India'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="font-semibold">₹ {tender.budget.estimated?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-secondary" />
              <span className="text-sm"><strong>Published:</strong> {new Date(tender.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-700" />
              <span className="text-sm"><strong className="text-red-700">Deadline:</strong> {new Date(tender.submissionDeadline).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Tender Description</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{tender.description || 'No description provided.'}</p>
            </div>

            {/* Category & Tags */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Category & Tags</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {tender.category}
                </span>
                {tender.tags?.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Budget Details */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Budget Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Type:</span>
                  <span className="font-semibold">{tender.budget.budgetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Amount:</span>
                  <span className="font-semibold">₹ {tender.budget.estimated?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-semibold">{tender.budget.currency}</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            {tender.documents && tender.documents.length > 0 && (
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h2 className="text-2xl font-bold text-primary mb-4">Documents</h2>
                <div className="space-y-3">
                  {tender.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        <span className="text-sm text-foreground">{doc.documentName}</span>
                      </div>
                      <button className="text-blue-600 hover:underline text-sm font-semibold">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
              <h3 className="text-xl font-bold text-primary mb-4">Interested in this tender?</h3>
              <p className="text-muted-foreground text-sm mb-6">Submit your bid before the deadline to be considered.</p>
              
              <button
                onClick={handleApply}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors mb-3"
              >
                {isAuthenticated ? 'Apply Now' : 'Login to Apply'}
              </button>
              
              <button className="w-full block text-center border border-gray-200 bg-white text-gray-900 shadow-sm py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors mb-4">
                Download Documents
              </button>
              
              <Link 
                to="/contact"
                className="w-full block text-center border border-gray-200 bg-white text-gray-900 shadow-sm py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Get Expert Help
              </Link>
              
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-bold mb-3">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-3">Our tender consultants can help you with:</p>
                <ul className="text-sm text-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Document preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Eligibility assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Bid submission support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}