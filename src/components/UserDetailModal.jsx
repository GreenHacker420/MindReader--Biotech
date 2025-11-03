'use client';

import { useState } from 'react';
import { X, Mail, Calendar, CreditCard, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export function UserDetailModal({ user, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('info');

  if (!isOpen || !user) return null;

  const subscriptionStatus = user.stripeSubscriptionId ? 'active' : 'inactive';
  const planName = user.plan === 'PRO' ? 'Premium' : 'Free';

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || 'User'}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Account Info
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'subscription'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'payment'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Payment
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Account Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900 mt-1">{user.name || 'Not provided'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Account Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-900 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email Verified</label>
                <div className="flex items-center gap-2 mt-1">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-gray-900">Yes</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-gray-900">No</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Plan</label>
                <p className="text-gray-900 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.plan === 'PRO'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {planName}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Subscription Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {subscriptionStatus === 'active' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-gray-900 font-medium">Active</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">Inactive</p>
                    </>
                  )}
                </div>
              </div>

              {user.stripeCurrentPeriodEnd && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Renewal Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Stripe Subscription ID</label>
                <p className="text-gray-900 mt-1 text-xs font-mono break-all">
                  {user.stripeSubscriptionId || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Stripe Customer ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 text-xs font-mono break-all">
                    {user.stripeCustomerId || 'Not linked'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Current Price ID</label>
                <p className="text-gray-900 mt-1 text-xs font-mono break-all">
                  {user.stripePriceId || 'N/A'}
                </p>
              </div>

              {user.stripeSubscriptionId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-900">
                    <strong>Subscription Active:</strong> This user has an active Stripe subscription and can access premium features.
                  </p>
                </div>
              )}

              {!user.stripeSubscriptionId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-900">
                    <strong>No Active Subscription:</strong> This user is on the free plan and does not have access to premium features.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
