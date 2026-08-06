import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, Users, Building2, FileText, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { error: showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) setAnalytics(data.data);
      }
    } catch (err: any) {
      showError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Platform insights and growth metrics</p>
            </div>
            <div className="flex gap-2">
              <Button variant={period === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('7d')}>7D</Button>
              <Button variant={period === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('30d')}>30D</Button>
              <Button variant={period === '90d' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('90d')}>90D</Button>
              <Button variant="outline" onClick={() => navigate('/admin')}>Back</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                +{analytics.summary.newUserCount} ({analytics.summary.userGrowth}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalOrganizations.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                +{analytics.summary.newOrganizationCount} ({analytics.summary.organizationGrowth}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalTenders.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                +{analytics.summary.newTenderCount} ({analytics.summary.tenderGrowth}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bids</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalBids.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                +{analytics.summary.newBidCount} ({analytics.summary.bidGrowth}%)
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle>Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCategories?.map((cat: any, i: number) => (
                  <div key={cat._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      <span className="text-sm font-medium capitalize">{cat._id}</span>
                    </div>
                    <Badge variant="outline">{cat.count} tenders</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Buyers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topBuyers?.map((buyer: any, i: number) => (
                  <div key={buyer._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      <span className="text-sm font-medium">{buyer._id}</span>
                    </div>
                    <Badge variant="outline">{buyer.count} tenders</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={20} />Top Sellers</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Rank</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Seller</th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">Total Bids</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topSellers?.map((seller: any, i: number) => (
                    <tr key={seller._id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{seller._id}</td>
                      <td className="py-3 px-4 text-right"><Badge variant="secondary">{seller.count} bids</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}