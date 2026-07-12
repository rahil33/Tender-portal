import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Mail, Users, Send, Search, Filter, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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
import { Textarea } from '../components/ui/textarea';

export default function AdminNotificationsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [broadcastDialog, setBroadcastDialog] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', type: 'info', targetAudience: 'all' });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications/failed', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setNotifications(data.data.data || []);
      }
    } catch (err: any) {
      showError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async () => {
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcastData),
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(data.message || 'Notification broadcasted');
        setBroadcastDialog(false);
        setBroadcastData({ title: '', message: '', type: 'info', targetAudience: 'all' });
      } else {
        showError('Failed to broadcast');
      }
    } catch (err: any) {
      showError('Failed to broadcast');
    }
  };

  const handleRetry = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(data.message || 'Retry initiated');
        fetchNotifications();
      }
    } catch (err: any) {
      showError('Retry failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
              <p className="text-sm text-gray-500 mt-1">Broadcast and manage notifications</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setBroadcastDialog(true)}><Send size={16} className="mr-2" /> Broadcast</Button>
              <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Bell size={24} /></div>
                <div>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <div className="text-sm text-gray-500">Total Sent</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600"><CheckCircle size={24} /></div>
                <div>
                  <div className="text-2xl font-bold">{Math.max(0, notifications.length - 1)}</div>
                  <div className="text-sm text-gray-500">Delivered</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100 text-red-600"><XCircle size={24} /></div>
                <div>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Failed Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Retry Count</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell>
                          <div className="font-medium">{notif.title}</div>
                          <div className="text-xs text-gray-500">{notif.message}</div>
                        </TableCell>
                        <TableCell>{notif.userId || 'N/A'}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{notif.type}</Badge></TableCell>
                        <TableCell>{notif.retryCount || 0}</TableCell>
                        <TableCell>{new Date(notif.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleRetry(notif.id)}>
                            <RefreshCw size={14} className="mr-1" /> Retry
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {notifications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                          No failed notifications
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={broadcastDialog} onOpenChange={setBroadcastDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Broadcast Notification</DialogTitle>
            <DialogDescription>Send a notification to all users or specific groups</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                value={broadcastData.title}
                onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter notification title"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={broadcastData.message}
                onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter notification message"
                rows={4}
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={broadcastData.type}
                onChange={(e) => setBroadcastData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div>
              <Label>Target Audience</Label>
              <select
                value={broadcastData.targetAudience}
                onChange={(e) => setBroadcastData(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Users</option>
                <option value="buyers">Buyers Only</option>
                <option value="sellers">Sellers Only</option>
                <option value="admins">Admins Only</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastDialog(false)}>Cancel</Button>
            <Button onClick={handleBroadcast}><Send size={16} className="mr-2" /> Broadcast</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}