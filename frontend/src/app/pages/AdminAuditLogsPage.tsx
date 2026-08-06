import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Search, Filter, Download, Calendar, User, Clock,
  CheckCircle, XCircle, AlertCircle, Mail, Bell
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export default function AdminAuditLogsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState({ action: '', resourceType: '', status: '', startDate: '', endDate: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [exportDialog, setExportDialog] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const res = await fetch(`/api/admin/audit/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.data.data);
          setPagination(prev => ({ ...prev, total: data.data.pagination.total }));
        }
      }
    } catch (err: any) {
      showError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (format: 'csv' | 'pdf') => {
    try {
      const res = await fetch(`/api/admin/audit/logs/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        showSuccess('Export successful');
        setExportDialog(false);
      }
    } catch (err: any) {
      showError('Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-500 mt-1">Track all system activities</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExportDialog(true)}><Download size={16} className="mr-2" /> Export</Button>
              <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
              <select
                value={filters.resourceType}
                onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">All Resources</option>
                <option value="user">User</option>
                <option value="tender">Tender</option>
                <option value="bid">Bid</option>
                <option value="organization">Organization</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{log.resourceType}</TableCell>
                        <TableCell>{log.performedByEmail || 'System'}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="capitalize">{log.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-gray-500">{log.ipAddress || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Audit Logs</DialogTitle>
            <DialogDescription>Select export format</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => exportLogs('csv')}>CSV</Button>
            <Button variant="outline" onClick={() => exportLogs('pdf')}>PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}