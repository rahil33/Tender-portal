import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock,
  Flag, DollarSign, MoreVertical, Calendar, Building, User,
  Download, AlertTriangle, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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

export default function AdminBidsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'withdraw' | 'flag' | null; reason: string }>({ open: false, type: null, reason: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchBids();
  }, [pagination.page]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/bids?page=${pagination.page}&limit=${pagination.limit}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBids(data.data.data);
          setPagination(prev => ({ ...prev, total: data.data.pagination.total }));
        }
      }
    } catch (err: any) {
      showError('Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedBid || !actionDialog.type) return;

    try {
      const endpoint = `/api/admin/bids/${selectedBid.id}/${actionDialog.type}`;
      const res = await fetch(endpoint, {
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
        fetchBids();
        setActionDialog({ open: false, type: null, reason: '' });
      } else {
        showError('Action failed');
      }
    } catch (err: any) {
      showError('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bid Management</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and moderate all bids</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Bids ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bid Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tender</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell>
                          <div className="font-medium">{bid.bidReference}</div>
                          <div className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={bid.status === 'submitted' ? 'default' : 'secondary'}>{bid.status}</Badge>
                        </TableCell>
                        <TableCell>{bid.tenderId || 'N/A'}</TableCell>
                        <TableCell>{bid.bidderName || 'Vendor'}</TableCell>
                        <TableCell>₹{bid.amount?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/bids/${bid.id}`)}><Eye size={16} className="mr-2" /> View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedBid(bid); setActionDialog({ open: true, type: 'withdraw', reason: '' }); }} className="text-orange-600"><Clock size={16} className="mr-2" /> Force Withdraw</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedBid(bid); setActionDialog({ open: true, type: 'flag', reason: '' }); }} className="text-red-600"><Flag size={16} className="mr-2" /> Flag Suspicious</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.type === 'withdraw' ? 'Force Withdraw Bid' : 'Flag Bid as Suspicious'}</DialogTitle>
            <DialogDescription>Provide a reason for this action.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={actionDialog.reason}
              onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, reason: '' })}>Cancel</Button>
            <Button onClick={handleAction} variant={actionDialog.type === 'flag' ? 'destructive' : 'default'}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}