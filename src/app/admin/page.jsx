'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  FileText,
  Database,
  FolderOpen,
  TrendingUp,
  DollarSign,
  Eye,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    proSubscriptions: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalLeads: 0,
    newLeads: 0,
    totalDatasets: 0,
    totalResources: 0,
    totalRevenue: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  async function fetchDashboardData() {
    try {
      const [usersRes, articlesRes, leadsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/articles'),
        fetch('/api/admin/leads'),
      ]);

      const usersData = await usersRes.json();
      const articlesData = await articlesRes.json();
      const leadsData = await leadsRes.json();

      const users = usersData.users || [];
      const articles = articlesData.articles || [];
      const leads = leadsData.leads || [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.emailVerified).length,
        admins: users.filter((u) => u.role === 'ADMIN').length,
        proSubscriptions: users.filter((u) => u.plan === 'PRO').length,
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.published).length,
        totalLeads: leads.length,
        newLeads: leads.filter((l) => l.status === 'NEW').length,
        totalDatasets: 0, // Will be fetched from datasets API
        totalResources: 0, // Will be fetched from resources API
        totalRevenue: users.filter((u) => u.plan === 'PRO').length * 12, // Estimate
        totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
      });

      setRecentUsers(users.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/admin/users',
    },
    {
      title: 'Admins',
      value: stats.admins,
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/users',
    },
    {
      title: 'Pro Subscribers',
      value: stats.proSubscriptions,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/admin/users',
    },
  ];

  const contentCards = [
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      subtitle: `${stats.publishedArticles} published`,
      icon: FileText,
      color: 'bg-indigo-500',
      link: '/admin/articles',
    },
    {
      title: 'Contact Leads',
      value: stats.totalLeads,
      subtitle: `${stats.newLeads} new`,
      icon: Mail,
      color: 'bg-pink-500',
      link: '/admin/leads',
    },
    {
      title: 'Datasets',
      value: stats.totalDatasets,
      subtitle: 'Available datasets',
      icon: Database,
      color: 'bg-cyan-500',
      link: '/admin/datasets',
    },
    {
      title: 'Resources',
      value: stats.totalResources,
      subtitle: 'Uploaded files',
      icon: FolderOpen,
      color: 'bg-orange-500',
      link: '/admin/resources',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {session?.user?.name || 'Admin'}</p>
        </div>

        {/* User Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.link}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content & Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.link}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || 'Unnamed User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : user.plan === 'PRO'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Admin' : user.plan}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Estimated Revenue</span>
                </div>
                <span className="text-lg font-bold text-gray-900">${stats.totalRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Article Views</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-600">Published Articles</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.publishedArticles}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-600">New Leads</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.newLeads}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
