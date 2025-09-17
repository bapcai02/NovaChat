'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar,
  Download,
  RefreshCw,
  Activity,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReportData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalBookmarks: number;
  userEngagement: number;
  averageSessionTime: number;
  topUsers: Array<{
    id: number;
    name: string;
    messageCount: number;
    bookmarkCount: number;
  }>;
  dailyStats: Array<{
    date: string;
    users: number;
    messages: number;
    bookmarks: number;
  }>;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReports({
        period: dateRange,
        start_date: customStartDate,
        end_date: customEndDate
      });
      setReportData(response.data);
    } catch (err) {
      console.error('Error loading reports:', err);
      // Fallback to mock data on error
      const mockData: ReportData = {
        period: 'Last 7 days',
        totalUsers: 1250,
        newUsers: 45,
        activeUsers: 890,
        totalMessages: 15420,
        totalBookmarks: 2340,
        userEngagement: 78.5,
        averageSessionTime: 24.5,
        topUsers: [
          { id: 1, name: 'John Doe', messageCount: 245, bookmarkCount: 12 },
          { id: 2, name: 'Jane Smith', messageCount: 189, bookmarkCount: 8 },
          { id: 3, name: 'Bob Wilson', messageCount: 156, bookmarkCount: 15 },
          { id: 4, name: 'Alice Johnson', messageCount: 134, bookmarkCount: 6 },
          { id: 5, name: 'Charlie Brown', messageCount: 98, bookmarkCount: 9 },
        ],
        dailyStats: [
          { date: '2024-01-15', users: 120, messages: 2100, bookmarks: 320 },
          { date: '2024-01-16', users: 135, messages: 2300, bookmarks: 340 },
          { date: '2024-01-17', users: 142, messages: 2450, bookmarks: 380 },
          { date: '2024-01-18', users: 138, messages: 2200, bookmarks: 350 },
          { date: '2024-01-19', users: 155, messages: 2600, bookmarks: 420 },
          { date: '2024-01-20', users: 148, messages: 2400, bookmarks: 390 },
          { date: '2024-01-21', users: 152, messages: 2370, bookmarks: 340 },
        ]
      };
      setReportData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange, customStartDate, customEndDate]);

  const handleExportReport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    // TODO: Implement export functionality
  };

  const handleRefresh = () => {
    loadReports();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-700">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Back to Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
                {dateRange === 'custom' && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-sm"
                    />
                    <span>to</span>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => handleExportReport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-700">{reportData?.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{reportData?.newUsers} new this period</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-700">{reportData?.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{((reportData?.activeUsers || 0) / (reportData?.totalUsers || 1) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold text-gray-700">{reportData?.totalMessages.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{(reportData?.totalMessages || 0) / (reportData?.activeUsers || 1)} per active user</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">User Engagement</p>
                <p className="text-2xl font-bold text-gray-700">{reportData?.userEngagement}%</p>
                <p className="text-xs text-gray-500">Average session: {reportData?.averageSessionTime}min</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#666"
                  />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="New Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="messages" 
                    stackId="2" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Messages"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookmarks" 
                    stackId="3" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.6}
                    name="Bookmarks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Users Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Active Users</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.topUsers || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="messageCount" 
                    fill="#3b82f6" 
                    name="Messages"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="bookmarkCount" 
                    fill="#10b981" 
                    name="Bookmarks"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active Users', value: reportData?.activeUsers || 0, color: '#10b981' },
                      { name: 'New Users', value: reportData?.newUsers || 0, color: '#3b82f6' },
                      { name: 'Inactive Users', value: (reportData?.totalUsers || 0) - (reportData?.activeUsers || 0) - (reportData?.newUsers || 0), color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Active Users', value: reportData?.activeUsers || 0, color: '#10b981' },
                      { name: 'New Users', value: reportData?.newUsers || 0, color: '#3b82f6' },
                      { name: 'Inactive Users', value: (reportData?.totalUsers || 0) - (reportData?.activeUsers || 0) - (reportData?.newUsers || 0), color: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Messages', value: reportData?.totalMessages || 0, color: '#3b82f6' },
                  { name: 'Bookmarks', value: reportData?.totalBookmarks || 0, color: '#10b981' },
                  { name: 'Engagement %', value: reportData?.userEngagement || 0, color: '#f59e0b' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Message Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Messages</span>
                <span className="font-semibold">{reportData?.totalMessages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Messages per Day</span>
                <span className="font-semibold">{Math.round((reportData?.totalMessages || 0) / 7)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg per User</span>
                <span className="font-semibold">{Math.round((reportData?.totalMessages || 0) / (reportData?.activeUsers || 1))}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">New Users</span>
                <span className="font-semibold text-green-600">+{reportData?.newUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth Rate</span>
                <span className="font-semibold">{((reportData?.newUsers || 0) / (reportData?.totalUsers || 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Rate</span>
                <span className="font-semibold">{((reportData?.activeUsers || 0) / (reportData?.totalUsers || 1) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Engagement Rate</span>
                <span className="font-semibold">{reportData?.userEngagement}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session Time</span>
                <span className="font-semibold">{reportData?.averageSessionTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookmarks</span>
                <span className="font-semibold">{reportData?.totalBookmarks.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
