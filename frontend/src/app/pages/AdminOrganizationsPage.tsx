import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Building2, Search, Filter, Eye, CheckCircle, XCircle, Shield,
  MoreVertical, Mail, Phone, FileText, Calendar, AlertCircle,
  UserCheck, UserX, Clock
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

interface Organization {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminOrganizationsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'verify' | 'reject' | 'suspend' | 'reactivate' | null;
    reason: string;
  }>({ open: false, type: null, reason: '' });

  useEffect(() => {
    fetchOrganizations();
  }, [pagination.page, verificationFilter, statusFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(verificationFilter && { isVerified: verificationFilter }),
        ...(statusFilter && { isActive: statusFilter === 'active' ? 'true' : 'false' }),
      });

      const res = await fetch(`/api/admin/organizations?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrganizations(data.data.data);
          setPagination(prev => ({ ...prev, total: data.data.pagination.total }));
        }
      }
    } catch (err: any) {
      showError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (isVerified: boolean) => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/admin/organizations/${selectedOrg.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified, verificationNotes: actionDialog.reason }),
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(data.message || `Organization ${isVerified ? 'verified' : 'rejected'}`);
        fetchOrganizations();
        setActionDialog({ open: false, type: null, reason: '' });
      } else {
        showError('Action failed');
      }
    } catch (err: any) {
      showError('Action failed');
    }
  };

  const handleStatusChange = async (suspend: boolean) => {
    if (!selectedOrg) return;
    try {
      const endpoint = suspend ? 'suspend' : 'reactivate';
      const res = await fetch(`/api/admin/organizations/${selectedOrg.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: actionDialog.reason }),
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(data.message);
        fetchOrganizations();
        setActionDialog({ open: false, type: null, reason: '' });
      } else {
        showError('Action failed');
      }
    } catch (err: any) {
      showError('Action failed');
    }
  };

  const openActionDialog = (org: Organization, type: typeof actionDialog.type) => {
    setSelectedOrg(org);
    setActionDialog({ open: true, type, reason: '' });
  };

  const handleAction = () => {
    if (actionDialog.type === 'verify' || actionDialog.type === 'reject') {
      handleVerification(actionDialog.type === 'verify');
    } else if (actionDialog.type === 'suspend' || actionDialog.type === 'reactivate') {
      handleStatusChange(actionDialog.type === 'suspend');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
              <p className="text-sm text-gray-500 mt-1">Verify and manage organizations</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by name or registration number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive/Suspended</option>
              </select>
              <Button onClick={fetchOrganizations}>
                <Filter size={16} className="mr-2" /> Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations ({pagination.total})</CardTitle>
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
                        <TableHead>Organization</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{org.name}</div>
                              <div className="text-sm text-gray-500">{org.registrationNumber}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Mail size={12} /> {org.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {org.isVerified ? (
                              <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                <CheckCircle size={12} /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <Clock size={12} /> Not Verified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {org.isActive ? (
                              <Badge variant="secondary">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Suspended</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(org.createdAt).toLocaleDateString()}
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
                                <DropdownMenuItem onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                                  <Eye size={16} className="mr-2" /> View Details
                                </DropdownMenuItem>
                                {!org.isVerified && (
                                  <>
                                    <DropdownMenuItem onClick={() => openActionDialog(org, 'verify')} className="text-green-600">
                                      <CheckCircle size={16} className="mr-2" /> Verify
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openActionDialog(org, 'reject')} className="text-red-600">
                                      <XCircle size={16} className="mr-2" /> Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {org.isActive ? (
                                  <DropdownMenuItem onClick={() => openActionDialog(org, 'suspend')} className="text-orange-600">
                                    <UserX size={16} className="mr-2" /> Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => openActionDialog(org, 'reactivate')} className="text-green-600">
                                    <UserCheck size={16} className="mr-2" /> Reactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} organizations
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page * pagination.limit >= pagination.total}>Next</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'verify' && 'Verify Organization'}
              {actionDialog.type === 'reject' && 'Reject Verification'}
              {actionDialog.type === 'suspend' && 'Suspend Organization'}
              {actionDialog.type === 'reactivate' && 'Reactivate Organization'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'verify' && 'This will verify the organization and grant them full access.'}
              {actionDialog.type === 'reject' && 'This will reject the organization verification request.'}
              {actionDialog.type === 'suspend' && 'This will suspend the organization.'}
              {actionDialog.type === 'reactivate' && 'This will reactivate the organization account.'}
            </DialogDescription>
          </DialogHeader>
          {(actionDialog.type === 'reject' || actionDialog.type === 'suspend') && (
            <div className="py-4">
              <label className="text-sm font-medium text-gray-700">Reason (Optional)</label>
              <textarea
                value={actionDialog.reason}
                onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason..."
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, reason: '' })}>Cancel</Button>
            <Button onClick={handleAction} variant={actionDialog.type === 'reject' || actionDialog.type === 'suspend' ? 'destructive' : 'default'}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}