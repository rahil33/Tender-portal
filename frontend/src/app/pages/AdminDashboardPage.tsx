import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Users, FileText, ShoppingBag, TrendingUp, CheckCircle,
  Clock, AlertCircle, XCircle, Loader2, Search, Filter,
  Eye, Download, ArrowRight, Shield, Settings, BarChart2,
  Activity, Building2, RefreshCw
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalTenders: number;
  totalBids: number;
  activeTenders: number;
  pendingModeration: number;
  openReports: number;
  systemHealth: string;
  newUsersToday: number;
  newTendersToday: number;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  activeUsers: number;
  suspendedUsers: number;
  blockedRequests: number;
  roleChanges: number;
}

interface GeMSyncStatus {
  lastSyncAt?: string;
  lastSyncStatus?: string;
  isSyncing?: boolean;
  gemReportedTotal?: number;
  pagesProcessed?: number;
  pagesExpected?: number;
  reachedFinalPage?: boolean;
  totalSynced?: number;
  totalInserted?: number;
  totalUpdated?: number;
  totalSkipped?: number;
  totalFailed?: number;
  totalExpired?: number;
  totalRemoved?: number;
  syncDuration?: number;
  lastSuccessfulFullSyncAt?: string;
  lastError?: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminDashboardPage() {
  const { error: showError, success: showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<GeMSyncStatus | null>(null);
  const [syncingNow, setSyncingNow] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchGeMSync();
  }, []);

  const fetchGeMSync = async () => {
    try {
      const syncRes = await api.get('/live-tenders/sync-status');
      const syncData = syncRes.data;
      if (syncData.success && syncData.data) {
        setSyncStatus(syncData.data.sync ?? null);
      }
    } catch (err) {
      console.error('Failed to fetch GeM sync status:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, securityRes, analyticsRes, auditRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/security/metrics'),
        api.get('/admin/analytics?period=30d'),
        api.get('/admin/audit/logs?page=1&limit=5'),
      ]);

      const statsData = statsRes.data;
      if (statsData.success) setStats(statsData.data);

      const securityData = securityRes.data;
      if (securityData.success) setSecurityMetrics(securityData.data);

      const analyticsResult = analyticsRes.data;
      if (analyticsResult.success) setAnalyticsData(analyticsResult.data);

      const auditData = auditRes.data;
      if (auditData.success) {
        setRecentActivities(
          auditData.data.data.map((log: any) => ({
            id: log.id,
            action: log.action,
            user: log.performedByEmail || 'System',
            time: new Date(log.createdAt).toLocaleString(),
            status: log.status,
            type: log.resourceType,
          }))
        );
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const runManualSync = async () => {
    if (syncingNow) return;
    setSyncingNow(true);
    try {
      const res = await api.post('/live-tenders/manual-sync');
      const data = res.data;
      if (data.success) {
        showSuccess('GeM sync completed', data.message || 'Synchronization completed');
      } else {
        showError(data.message || 'GeM sync failed');
      }
      await fetchGeMSync();
    } catch (err: any) {
      console.error('Manual sync failed:', err);
      showError(err.response?.data?.message || err.message || 'Manual sync failed');
    } finally {
      setSyncingNow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const statsCards = [
    { label: 'Total Users', value: stats?.totalUsers.toLocaleString() || '0', sub: `${stats?.newUsersToday || 0} new today`, icon: <Users size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Organizations', value: stats?.totalOrganizations.toLocaleString() || '0', sub: 'Verified & pending', icon: <Building2 size={22} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Tenders', value: stats?.activeTenders.toLocaleString() || '0', sub: `${stats?.newTendersToday || 0} new today`, icon: <FileText size={22} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Bids', value: stats?.totalBids.toLocaleString() || '0', sub: 'Across all tenders', icon: <ShoppingBag size={22} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending', value: stats?.pendingModeration.toLocaleString() || '0', sub: 'Awaiting review', icon: <Clock size={22} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Reports', value: stats?.openReports.toLocaleString() || '0', sub: 'Needs attention', icon: <AlertCircle size={22} />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'success': return { color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> };
      case 'failure': return { color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> };
      default: return { color: '#d97706', bg: '#fef3c7', icon: <Clock size={14} /> };
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms || ms <= 0) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-500 font-medium">Administrator</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">System Overview & Management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchDashboardData}>Refresh</Button>
              <Button variant="outline"><Download size={16} className="mr-2" /> Export</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statsCards.map((s, i) => (
            <div key={i} className="rounded-2xl p-4 bg-white border border-gray-200 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>{s.icon}</div>
              <div className="text-xl font-bold mb-1 text-gray-900">{s.value}</div>
              <div className="text-xs font-semibold text-gray-900">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link to="/admin/users" className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600"><Users size={24} /></div>
              <div><h3 className="font-bold text-gray-900">Manage Users</h3><p className="text-sm text-gray-500">View & moderate</p></div>
            </div>
          </Link>
          <Link to="/admin/tenders" className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600"><FileText size={24} /></div>
              <div><h3 className="font-bold text-gray-900">Manage Tenders</h3><p className="text-sm text-gray-500">Review & approve</p></div>
            </div>
          </Link>
          <Link to="/admin/organizations" className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600"><Shield size={24} /></div>
              <div><h3 className="font-bold text-gray-900">Organizations</h3><p className="text-sm text-gray-500">Verify & manage</p></div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader><CardTitle className="text-lg font-bold">User Growth (30 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Chart visualization available in Analytics page</p>
                  <Button variant="link" onClick={() => window.location.href = '/admin/analytics'}>View Analytics →</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-bold">Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart2 size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Category breakdown available in Analytics page</p>
                  <Button variant="link" onClick={() => window.location.href = '/admin/analytics'}>View Analytics →</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity size={20} />GeM Live Tender Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{syncStatus?.gemReportedTotal?.toLocaleString() ?? 'N/A'}</div>
                <div className="text-xs text-gray-500 font-medium">GeM Ongoing Bids</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{syncStatus?.pagesProcessed ?? 0}<span className="text-sm text-gray-400 font-medium"> / {syncStatus?.pagesExpected ?? 0}</span></div>
                <div className="text-xs text-gray-500 font-medium">Pages Processed</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{syncStatus?.totalInserted ?? 0}</div>
                <div className="text-xs text-gray-500 font-medium">Inserted</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{syncStatus?.totalUpdated ?? 0}</div>
                <div className="text-xs text-gray-500 font-medium">Updated</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{syncStatus?.totalExpired ?? 0} / {syncStatus?.totalRemoved ?? 0}</div>
                <div className="text-xs text-gray-500 font-medium">Expired / Removed</div>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="text-2xl font-bold text-red-600">{syncStatus?.totalFailed ?? 0}</div>
                <div className="text-xs text-red-700 font-medium">Failed</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center gap-1.5">
                Status:
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                  style={(() => {
                    const status = syncStatus?.isSyncing ? 'syncing' : (syncStatus?.lastSyncStatus || 'never');
                    const meta = getStatusMeta(syncStatus?.lastSyncStatus || 'never');
                    return { backgroundColor: meta.bg, color: meta.color };
                  })()}
                >
                  {syncStatus?.isSyncing ? 'Syncing...' : (syncStatus?.lastSyncStatus || 'Never synced')}
                </span>
              </span>
              <span>Last sync: <strong>{formatDate(syncStatus?.lastSyncAt)}</strong></span>
              <span>Duration: <strong>{formatDuration(syncStatus?.syncDuration)}</strong></span>
              <span>Final page reached: <strong>{syncStatus?.reachedFinalPage ? 'Yes' : 'No'}</strong></span>
              <span>Last full sync: <strong>{formatDate(syncStatus?.lastSuccessfulFullSyncAt)}</strong></span>
            </div>

            {syncStatus?.lastError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
                Last error: {syncStatus.lastError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={runManualSync} disabled={syncingNow || !!syncStatus?.isSyncing}>
                {syncingNow || syncStatus?.isSyncing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                {syncingNow || syncStatus?.isSyncing ? 'Syncing...' : 'Run GeM Sync Now'}
              </Button>
              <Button variant="outline" onClick={fetchGeMSync}>Refresh Status</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-10">
          <CardHeader><CardTitle className="text-lg font-bold">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const meta = getStatusMeta(activity.status);
                  return (
                    <div key={activity.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.user} • {activity.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: meta.bg, color: meta.color }}>
                          {meta.icon} {activity.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500"><Activity size={48} className="mx-auto mb-2 text-gray-300" /><p>No recent activity</p></div>
              )}
            </div>
          </CardContent>
        </Card>

        {securityMetrics && (
          <Card>
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Shield size={20} />Security Overview (Last 24 Hours)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{securityMetrics.failedLogins}</div>
                  <div className="text-xs text-red-700 font-medium">Failed Logins</div>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="text-2xl font-bold text-orange-600">{securityMetrics.suspiciousActivities}</div>
                  <div className="text-xs text-orange-700 font-medium">Suspicious</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{securityMetrics.activeUsers}</div>
                  <div className="text-xs text-blue-700 font-medium">Active Users</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-2xl font-bold text-gray-600">{securityMetrics.suspendedUsers}</div>
                  <div className="text-xs text-gray-700 font-medium">Suspended</div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                  <div className="text-2xl font-bold text-yellow-600">{securityMetrics.blockedRequests}</div>
                  <div className="text-xs text-yellow-700 font-medium">Blocked</div>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">{securityMetrics.roleChanges}</div>
                  <div className="text-xs text-purple-700 font-medium">Role Changes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}