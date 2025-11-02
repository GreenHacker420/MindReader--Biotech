'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Mail, Activity, Shield, CreditCard, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '../../components/toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingStripeDetails, setLoadingStripeDetails] = useState(false);
  const [subscriptionDisplaySettings, setSubscriptionDisplaySettings] = useState({
    showCustomerId: true,
    showSubscriptionId: true,
    showPaymentMethods: true,
    showInvoices: true,
    showPeriodEnd: true,
  });
  const { showToast } = useToast();

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

    fetchData();
  }, [session, status, router]);

  async function fetchData() {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData.users);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  }

  async function fetchUserDetails(userId) {
    setLoadingDetails(true);
    setSelectedUser(userId);
    setUserDetails(null); // Clear previous details
    try {
      // Fetch user data immediately (fast)
      const res = await fetch(`/api/admin/users/${userId}/details`);
      const data = await res.json();
      if (res.ok) {
        setUserDetails(data);
        setLoadingDetails(false);
        
        // Fetch Stripe details in background if needed
        if (data.loadingStripe && (data.user.stripeCustomerId || data.user.stripeSubscriptionId)) {
          setLoadingStripeDetails(true);
          fetchStripeDetails(userId, data);
        }
      } else {
        showToast(data.error || 'Failed to load user details', 'error');
        console.error('Failed to fetch user details:', data);
        setLoadingDetails(false);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      showToast('Failed to load user details. Please try again.', 'error');
      setLoadingDetails(false);
    }
  }

  async function fetchStripeDetails(userId, currentDetails) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/stripe-details`);
      const data = await res.json();
      if (res.ok) {
        setUserDetails({
          ...currentDetails,
          stripeCustomer: data.stripeCustomer,
          stripeSubscription: data.stripeSubscription,
          invoices: data.invoices,
          loadingStripe: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch Stripe details:', error);
    } finally {
      setLoadingStripeDetails(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users, emails, and system settings</p>
          </div>
          <a
            href="/admin/resources"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resources
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pro Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.plan === 'PRO').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalEmails || 0}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.adminUsers || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Display Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Display Settings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionDisplaySettings.showCustomerId}
                onChange={(e) => setSubscriptionDisplaySettings(prev => ({
                  ...prev,
                  showCustomerId: e.target.checked
                }))}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Show Customer ID</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionDisplaySettings.showSubscriptionId}
                onChange={(e) => setSubscriptionDisplaySettings(prev => ({
                  ...prev,
                  showSubscriptionId: e.target.checked
                }))}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Show Subscription ID</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionDisplaySettings.showPaymentMethods}
                onChange={(e) => setSubscriptionDisplaySettings(prev => ({
                  ...prev,
                  showPaymentMethods: e.target.checked
                }))}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Show Payment Methods</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionDisplaySettings.showInvoices}
                onChange={(e) => setSubscriptionDisplaySettings(prev => ({
                  ...prev,
                  showInvoices: e.target.checked
                }))}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Show Invoices</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={subscriptionDisplaySettings.showPeriodEnd}
                onChange={(e) => setSubscriptionDisplaySettings(prev => ({
                  ...prev,
                  showPeriodEnd: e.target.checked
                }))}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Show Period End</span>
            </label>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.plan === 'PRO' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.stripeSubscriptionId ? (
                        <div className="text-sm">
                          <div className="text-gray-900 font-mono text-xs">
                            {user.stripeSubscriptionId.substring(0, 20)}...
                          </div>
                          {user.stripeCurrentPeriodEnd && (
                            <div className="text-gray-500 text-xs mt-1">
                              Ends: {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No subscription</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => fetchUserDetails(user.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </button>
                      {user.stripeSubscriptionId && (
                        <a
                          href={`https://dashboard.stripe.com/test/subscriptions/${user.stripeSubscriptionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 mr-4"
                        >
                          Stripe
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
            setSelectedUser(null);
            setUserDetails(null);
          }}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  User Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading user details...</p>
                  </div>
                ) : userDetails ? (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">{userDetails.user.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{userDetails.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Plan</p>
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                            userDetails.user.plan === 'PRO' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userDetails.user.plan || 'FREE'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Role</p>
                          <p className="font-medium">{userDetails.user.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Joined</p>
                          <p className="font-medium">{new Date(userDetails.user.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="font-medium">{new Date(userDetails.user.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Customer Info */}
                    {loadingStripeDetails && userDetails.loadingStripe && (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading Stripe details...</p>
                      </div>
                    )}
                    {userDetails.stripeCustomer && !loadingStripeDetails && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stripe Customer</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="grid md:grid-cols-2 gap-4">
                            {subscriptionDisplaySettings.showCustomerId && (
                              <div>
                                <p className="text-sm text-gray-600">Customer ID</p>
                                <p className="font-mono text-sm">{userDetails.stripeCustomer.id}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{userDetails.stripeCustomer.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Created</p>
                              <p className="font-medium">
                                {new Date(userDetails.stripeCustomer.created * 1000).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Balance</p>
                              <p className="font-medium">
                                ${(userDetails.stripeCustomer.balance / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {subscriptionDisplaySettings.showPaymentMethods && userDetails.stripeCustomer.paymentMethods?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 mb-2">Payment Methods</p>
                              {userDetails.stripeCustomer.paymentMethods.map((pm, idx) => (
                                <div key={idx} className="bg-white rounded p-2 mt-2">
                                  <p className="text-sm font-medium">
                                    {pm.card?.brand?.toUpperCase()} •••• {pm.card?.last4}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Subscription Info */}
                    {userDetails.stripeSubscription && !loadingStripeDetails && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                        <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                          <div className="grid md:grid-cols-2 gap-4">
                            {subscriptionDisplaySettings.showSubscriptionId && (
                              <div>
                                <p className="text-sm text-gray-600">Subscription ID</p>
                                <p className="font-mono text-sm">{userDetails.stripeSubscription.id}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                                userDetails.stripeSubscription.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {userDetails.stripeSubscription.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Current Period Start</p>
                              <p className="font-medium">
                                {new Date(userDetails.stripeSubscription.current_period_start * 1000).toLocaleDateString()}
                              </p>
                            </div>
                            {subscriptionDisplaySettings.showPeriodEnd && (
                              <div>
                                <p className="text-sm text-gray-600">Current Period End</p>
                                <p className="font-medium">
                                  {new Date(userDetails.stripeSubscription.current_period_end * 1000).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">Cancel at Period End</p>
                              <p className="font-medium">
                                {userDetails.stripeSubscription.cancel_at_period_end ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="font-medium">
                                ${(userDetails.stripeSubscription.items.data[0]?.price.unit_amount / 100).toFixed(2)}/
                                {userDetails.stripeSubscription.items.data[0]?.price.recurring?.interval || 'month'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoices */}
                    {subscriptionDisplaySettings.showInvoices && userDetails.invoices?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {userDetails.invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                  <td className="px-4 py-2">
                                    {new Date(invoice.created).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2">
                                    ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      invoice.status === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {invoice.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    {invoice.hostedInvoiceUrl && (
                                      <a
                                        href={invoice.hostedInvoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        View
                                      </a>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Stripe Dashboard Links */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      {userDetails.user.stripeCustomerId && (
                        <a
                          href={`https://dashboard.stripe.com/test/customers/${userDetails.user.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          View in Stripe Dashboard
                        </a>
                      )}
                      {userDetails.user.stripeSubscriptionId && (
                        <a
                          href={`https://dashboard.stripe.com/test/subscriptions/${userDetails.user.stripeSubscriptionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Subscription
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Failed to load user details</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
