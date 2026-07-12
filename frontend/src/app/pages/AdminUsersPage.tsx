import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Users, Search, Filter, Eye, UserX, UserCheck, Lock, LogOut, Trash2,
  MoreVertical, Mail, Phone, Building, Calendar, Shield, AlertCircle
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
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  status: string;
  phone?: string;
  companyName?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'suspend' | 'reactivate' | 'reset' | 'logout' | 'delete' | null;
    reason: string;
  }>({ open: false, type: null, reason: '' });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter === 'active' ? 'true' : 'false' }),
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.data.data);
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total,
            pages: data.data.pagination.pages,
          }));
        }
      }
    } catch (err: any) {
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionDialog.type) return;

    try {
      const endpoint = `/api/admin/users/${selectedUser.id}/${actionDialog.type}`;
      const method = actionDialog.type === 'delete' ? 'DELETE' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: actionDialog.reason ? JSON.stringify({ reason: actionDialog.reason }) : undefined,
      });

      if (res.ok) {
        showSuccess(`User ${actionDialog.type}d successfully`);
        fetchUsers();
        setActionDialog({ open: false, type: null, reason: '' });
      } else {
        const data = await res.json();
        showError(data.message || 'Action failed');
      }
    } catch (err: any) {
      showError('Action failed');
    }
  };

  const openActionDialog = (user: User, type: typeof actionDialog.type) => {
    setSelectedUser(user);
    setActionDialog({ open: true, type, reason: '' });
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive || user.status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      buyer: 'bg-blue-100 text-blue-700',
      seller: 'bg-green-100 text-green-700',
      vendor: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all platform users</p>
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
                  placeholder="Search by name, email, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="vendor">Vendor</option>
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
              <Button onClick={fetchUsers}>
                <Filter size={16} className="mr-2" /> Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({pagination.total})</CardTitle>
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
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.companyName && (
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                  <Building size={12} /> {user.companyName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
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
                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                                  <Eye size={16} className="mr-2" /> View Details
                                </DropdownMenuItem>
                                {user.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog(user, 'suspend')}
                                    className="text-orange-600"
                                  >
                                    <UserX size={16} className="mr-2" /> Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog(user, 'reactivate')}
                                    className="text-green-600"
                                  >
                                    <UserCheck size={16} className="mr-2" /> Reactivate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(user, 'reset')}
                                  className="text-blue-600"
                                >
                                  <Lock size={16} className="mr-2" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(user, 'logout')}
                                  className="text-purple-600"
                                >
                                  <LogOut size={16} className="mr-2" /> Force Logout
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(user, 'delete')}
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
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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
                      disabled={pagination.page >= pagination.pages}
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
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'suspend' && 'Suspend User'}
              {actionDialog.type === 'reactivate' && 'Reactivate User'}
              {actionDialog.type === 'reset' && 'Reset Password'}
              {actionDialog.type === 'logout' && 'Force Logout'}
              {actionDialog.type === 'delete' && 'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'suspend' && 'This will suspend the user account and prevent them from logging in.'}
              {actionDialog.type === 'reactivate' && 'This will reactivate the user account.'}
              {actionDialog.type === 'reset' && 'This will reset the user password. A temporary password will be generated.'}
              {actionDialog.type === 'logout' && 'This will log out the user from all active sessions.'}
              {actionDialog.type === 'delete' && 'This will soft-delete the user account. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          {(actionDialog.type === 'suspend' || actionDialog.type === 'delete') && (
            <div className="py-4">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={actionDialog.reason}
                onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for this action..."
                className="mt-2"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, reason: '' })}>
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