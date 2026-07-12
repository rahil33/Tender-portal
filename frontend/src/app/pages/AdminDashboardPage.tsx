import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Users, FileText, ShoppingBag, TrendingUp, CheckCircle,
  Clock, AlertCircle, XCircle, Loader2, Search, Filter,
  Eye, Download, ArrowRight, Shield, Settings, BarChart2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface DashboardStats {
  totalUsers: number;
  totalTenders: number;
  pendingApprovals: number;
  totalRevenue: string;
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalTenders: 0,
  pendingApprovals: 0,
  totalRevenue: '₹0',
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tenders' | 'settings'>('overview');
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats from API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        totalUsers: 245,
        totalTenders: 89,
        pendingApprovals: 12,
        totalRevenue: '₹2.4Cr',
      });
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      showError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), sub: 'Across all roles', icon: <Users size={22} />, color: 'text-gray-900' },
    { label: 'Total Tenders', value: stats.totalTenders.toString(), sub: 'Published & pending', icon: <FileText size={22} />, color: 'text-gray-900' },
    { label: 'Pending Approvals', value: stats.pendingApprovals.toString(), sub: 'Awaiting review', icon: <Clock size={22} />, color: 'text-gray-900' },
    { label: 'Platform Revenue', value: stats.totalRevenue, sub: 'This quarter', icon: <TrendingUp size={22} />, color: 'text-gray-900' },
  ];

  const recentActivities = [
    { id: 1, action: 'New vendor registration', user: 'Acme Enterprises', time: '2 hours ago', status: 'pending' },
    { id: 2, action: 'Tender submitted', user: 'Tech Solutions Pvt Ltd', time: '3 hours ago', status: 'pending' },
    { id: 3, action: 'Tender approved', user: 'Office Supplies Co', time: '5 hours ago', status: 'approved' },
    { id: 4, action: 'User verified', user: 'Government Dept', time: '1 day ago', status: 'approved' },
    { id: 5, action: 'Tender rejected', user: 'Invalid Corp', time: '1 day ago', status: 'rejected' },
  ];

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> };
      case 'rejected':
        return { color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> };
      default:
        return { color: '#d97706', bg: '#fef3c7', icon: <Clock size={14} /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Dashboard Header */}
      <div className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-500 font-medium">Administrator</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">System Overview & Management</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium">
                <Download size={16} /> Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statsCards.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md duration-200"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gray-50 border border-gray-100 text-gray-700">
                {s.icon}
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">{s.value}</div>
              <div className="text-sm font-semibold text-gray-900">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit bg-gray-50 border border-gray-100">
          {[
            { key: 'overview', label: 'Overview', icon: <BarChart2 size={15} /> },
            { key: 'users', label: 'Users', icon: <Users size={15} /> },
            { key: 'tenders', label: 'Tenders', icon: <FileText size={15} /> },
            { key: 'settings', label: 'Settings', icon: <Settings size={15} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 border border-transparent'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <Link
                to="/admin/users"
                className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Manage Users</h3>
                    <p className="text-sm text-gray-500">View & moderate users</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/admin/tenders"
                className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-green-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Manage Tenders</h3>
                    <p className="text-sm text-gray-500">Review & approve</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/admin/organizations"
                className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-purple-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Organizations</h3>
                    <p className="text-sm text-gray-500">Verify & manage</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-5 text-gray-900">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const meta = getStatusMeta(activity.status);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.user}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.icon} {activity.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">User Management</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>User list will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'tenders' && (
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">Tender Management</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search tenders..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Tender list will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-gray-900">System Settings</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">Platform Settings</p>
                <p className="text-sm text-gray-500">Configure system-wide settings</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">Email Configuration</p>
                <p className="text-sm text-gray-500">SMTP and notification settings</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">Security Settings</p>
                <p className="text-sm text-gray-500">JWT, sessions, and access control</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}