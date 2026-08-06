import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock,
  Archive, RotateCcw, Trash2, MoreVertical, Calendar, Building,
  User, DollarSign, Tag, AlertTriangle, Shield, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Tender {
  id: string;
  title: string;
  tenderNumber: string;
  status: string;
  category: string;
  createdBy: string;
  issuingOrganization: string;
  budget?: number;
  deadline?: string;
  createdAt: string;
  isArchived: boolean;
}

export default function AdminTendersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { tenderId } = useParams<{ tenderId: string }>();
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete' | null;
  }>({ open: false, type: null });

  useEffect(() => {
    fetchTenders();
  }, [pagination.page, statusFilter, categoryFilter]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const res = await fetch(`/api/admin/tenders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTenders(data.data.data);
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total,
          }));
        }
      }
    } catch (err: any) {
      showError('Failed to fetch tenders');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedTender || !actionDialog.type) return;

    try {
      const endpoint = `/api/admin/tenders/${selectedTender.id}/${actionDialog.type}`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(data.message || `Tender ${actionDialog.type}d successfully`);
        fetchTenders();
        setActionDialog({ open: false, type: null });
      } else {
        const data = await res.json();
        showError(data.message || 'Action failed');
      }
    } catch (err: any) {
      showError('Action failed');
    }
  };

  const openActionDialog = (tender: Tender, type: typeof actionDialog.type) => {
    setSelectedTender(tender);
    setActionDialog({ open: true, type });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      draft: <Badge variant="secondary">Draft</Badge>,
      published: <Badge className="bg-green-100 text-green-700">Published</Badge>,
      closed: <Badge variant="outline">Closed</Badge>,
      awarded: <Badge className="bg-blue-100 text-blue-700">Awarded</Badge>,
      cancelled: <Badge variant="destructive">Cancelled</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  if (selectedTender && tenderId) {
    return (
      <TenderDetail
        tender={selectedTender}
        token={token!}
        onBack={() => navigate('/admin/tenders')}
        onAction={(type: any) => openActionDialog(selectedTender, type)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tender Management</h1>
              <p className="text-sm text-gray-500 mt-1">Moderate and manage all tenders</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by title or tender number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="goods">Goods</option>
                <option value="services">Services</option>
                <option value="works">Works</option>
              </select>
              <Button onClick={fetchTenders}>
                <Filter size={16} className="mr-2" /> Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tenders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tenders ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tender</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenders.map((tender) => (
                        <TableRow key={tender.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{tender.title}</div>
                              <div className="text-sm text-gray-500">{tender.tenderNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(tender.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Tag size={14} /> {tender.category}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">{tender.issuingOrganization}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(tender.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedTender(tender); navigate(`/admin/tenders/${tender.id}`); }}>
                                  <Eye size={16} className="mr-2" /> View Details
                                </DropdownMenuItem>
                                {tender.status === 'draft' && (
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog(tender, 'publish')}
                                    className="text-green-600"
                                  >
                                    <CheckCircle size={16} className="mr-2" /> Publish
                                  </DropdownMenuItem>
                                )}
                                {tender.status === 'published' && (
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog(tender, 'unpublish')}
                                    className="text-orange-600"
                                  >
                                    <Clock size={16} className="mr-2" /> Unpublish
                                  </DropdownMenuItem>
                                )}
                                {!tender.isArchived ? (
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog(tender, 'archive')}
                                    className="text-blue-600"
                                  >
                                    <Archive size={16} className="mr-2" /> Archive
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog(tender, 'restore')}
                                    className="text-blue-600"
                                  >
                                    <RotateCcw size={16} className="mr-2" /> Restore
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(tender, 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 size={16} className="mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tenders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'publish' && 'Publish Tender'}
              {actionDialog.type === 'unpublish' && 'Unpublish Tender'}
              {actionDialog.type === 'archive' && 'Archive Tender'}
              {actionDialog.type === 'restore' && 'Restore Tender'}
              {actionDialog.type === 'delete' && 'Delete Tender'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'publish' && 'This will make the tender visible to all sellers.'}
              {actionDialog.type === 'unpublish' && 'This will hide the tender from sellers.'}
              {actionDialog.type === 'archive' && 'This will move the tender to archived status.'}
              {actionDialog.type === 'restore' && 'This will restore the tender from archive.'}
              {actionDialog.type === 'delete' && 'This will permanently delete the tender. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null })}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={actionDialog.type === 'delete' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tender Detail Component
function TenderDetail({ tender, token, onBack, onAction }: any) {
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="outline" onClick={onBack}>← Back to Tenders</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{tender.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tender Number</label>
                  <p className="text-gray-900">{tender.tenderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900 capitalize">{tender.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900 capitalize">{tender.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Issuing Organization</label>
                  <p className="text-gray-900">{tender.issuingOrganization}</p>
                </div>
                {tender.budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget</label>
                    <p className="text-gray-900">₹{tender.budget.toLocaleString()}</p>
                  </div>
                )}
                {tender.deadline && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deadline</label>
                    <p className="text-gray-900">{new Date(tender.deadline).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tender.status === 'draft' && (
                <Button className="w-full" onClick={() => onAction('publish')}>
                  <CheckCircle size={16} className="mr-2" /> Publish Tender
                </Button>
              )}
              {tender.status === 'published' && (
                <Button className="w-full" variant="outline" onClick={() => onAction('unpublish')}>
                  <Clock size={16} className="mr-2" /> Unpublish
                </Button>
              )}
              {!tender.isArchived ? (
                <Button className="w-full" variant="outline" onClick={() => onAction('archive')}>
                  <Archive size={16} className="mr-2" /> Archive
                </Button>
              ) : (
                <Button className="w-full" variant="outline" onClick={() => onAction('restore')}>
                  <RotateCcw size={16} className="mr-2" /> Restore
                </Button>
              )}
              <Button className="w-full" variant="destructive" onClick={() => onAction('delete')}>
                <Trash2 size={16} className="mr-2" /> Delete Tender
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}