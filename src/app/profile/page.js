"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Mail, User, CreditCard, Settings, CheckCircle, Calendar, DollarSign, AlertCircle, Download, Lock, FileText, Eye } from "lucide-react";
import { useToast } from "../../components/toast";
import { ConfirmationDialog } from "../../components/confirmation-dialog";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [premiumResources, setPremiumResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const isPro = session?.user?.plan === 'PRO';
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch subscription details
  useEffect(() => {
    if (isPro && session?.user?.email) {
      fetchSubscriptionDetails();
    }
  }, [isPro, session?.user?.email]);

  // Fetch premium resources
  useEffect(() => {
    if (session?.user?.email) {
      fetchPremiumResources();
    }
  }, [session?.user?.email]);

  async function fetchSubscriptionDetails() {
    setLoadingSubscription(true);
    try {
      const res = await fetch('/api/stripe/subscription/status');
      const data = await res.json();
      if (res.ok) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  }

  async function fetchPremiumResources() {
    setLoadingResources(true);
    try {
      const res = await fetch('/api/resources?accessLevel=PRO');
      const data = await res.json();
      if (res.ok) {
        setPremiumResources(data.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoadingResources(false);
    }
  }

  async function handleManageBilling() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        showToast(data.error || data.details || 'Failed to open billing portal', 'error');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      showToast('Failed to open billing portal. Please configure it in Stripe Dashboard first.', 'error');
    }
  }

  async function handleCancelSubscription() {
    setShowCancelConfirm(true);
  }

  async function confirmCancelSubscription() {
    setShowCancelConfirm(false);
    setCanceling(true);
    try {
      const res = await fetch('/api/stripe/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Subscription will be canceled at the end of the current period. You will continue to have access until then.', 'success');
        fetchSubscriptionDetails();
        update();
      } else {
        showToast(data.error || 'Failed to cancel subscription', 'error');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      showToast('Failed to cancel subscription. Please try again.', 'error');
    } finally {
      setCanceling(false);
    }
  }

  async function handleResumeSubscription() {
    setShowResumeConfirm(true);
  }

  async function confirmResumeSubscription() {
    setShowResumeConfirm(false);
    setCanceling(true);
    try {
      const res = await fetch('/api/stripe/subscription/resume', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Subscription resumed successfully!', 'success');
        fetchSubscriptionDetails();
        update();
      } else {
        showToast(data.error || 'Failed to resume subscription', 'error');
      }
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      showToast('Failed to resume subscription. Please try again.', 'error');
    } finally {
      setCanceling(false);
    }
  }

  async function handleDownload(resourceId, fileUrl, title) {
    if (!isPro) {
      router.push('/pricing');
      return;
    }
    
    try {
      // Open in new tab for download
      window.open(fileUrl, '_blank');
      showToast('Download started', 'success');
    } catch (error) {
      showToast('Failed to download resource', 'error');
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-20 h-20 rounded-full border-4 border-blue-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-500">
                {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user.name || "User"}!
              </h1>
              <p className="text-gray-600 mt-1">{session.user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {session.user.role || "USER"}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {session.user.plan || "FREE"} Plan
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  session.user.emailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {session.user.emailVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Account Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">Active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Email Verified</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {session.user.emailVerified ? "Yes" : "Pending"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {session.user.plan || "FREE"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Management - PRO Users */}
        {isPro && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-purple-600" />
              Subscription Details
            </h2>
            
            {loadingSubscription ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading subscription details...</p>
              </div>
            ) : subscription?.hasSubscription ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Current Period End</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscription.subscription?.currentPeriodEnd
                        ? new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Amount</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscription.subscription?.amount
                        ? `$${(subscription.subscription.amount / 100).toFixed(2)} ${subscription.subscription.currency?.toUpperCase()} /month`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {subscription.subscription?.cancelAtPeriodEnd && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">Subscription Canceled</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your subscription will end on {subscription.subscription.cancelAt
                          ? new Date(subscription.subscription.cancelAt).toLocaleDateString()
                          : 'the end of the current period'}. You'll continue to have access until then.
                      </p>
                    </div>
                    <button
                      onClick={handleResumeSubscription}
                      disabled={canceling}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canceling ? 'Processing...' : 'Resume'}
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleManageBilling}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Manage Billing & Payment Methods
                  </button>
                  {!subscription.subscription?.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canceling ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
                
                <ConfirmationDialog
                  isOpen={showCancelConfirm}
                  title="Cancel Subscription"
                  message="Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period."
                  onConfirm={confirmCancelSubscription}
                  onCancel={() => setShowCancelConfirm(false)}
                  confirmText="Cancel Subscription"
                  cancelText="Keep Subscription"
                  confirmButtonColor="bg-red-600 hover:bg-red-700"
                />
                
                <ConfirmationDialog
                  isOpen={showResumeConfirm}
                  title="Resume Subscription"
                  message="Resume your subscription? Your subscription will continue after the current period."
                  onConfirm={confirmResumeSubscription}
                  onCancel={() => setShowResumeConfirm(false)}
                  confirmText="Resume"
                  cancelText="Cancel"
                  confirmButtonColor="bg-green-600 hover:bg-green-700"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Unable to load subscription details.</p>
                <button
                  onClick={fetchSubscriptionDetails}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Premium Resources */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-purple-600" />
              My Premium Resources
            </h2>
            {!isPro && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Upgrade to PRO
              </Link>
            )}
          </div>

          {loadingResources ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resources...</p>
            </div>
          ) : premiumResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premiumResources.map((resource) => (
                <div
                  key={resource.id}
                  className={`relative border rounded-lg p-4 transition-all ${
                    isPro
                      ? 'border-gray-200 hover:border-purple-500 hover:shadow-md bg-white'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {!isPro && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <div className="text-center p-4">
                        <Lock className="w-12 h-12 text-white mx-auto mb-3" />
                        <p className="text-white font-semibold mb-2">Premium Resource</p>
                        <Link
                          href="/pricing"
                          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Upgrade to PRO
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {resource.fileType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isPro && (
                    <div className="mt-4 flex gap-2">
                      {(resource.fileType === 'pdf' || resource.fileType === 'excel' || resource.fileType === 'xlsx' || resource.fileType === 'csv') && (
                        <Link
                          href={`/resources/${resource.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Link>
                      )}
                      <button
                        onClick={() => handleDownload(resource.id, resource.fileUrl, resource.title)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isPro ? 'No premium resources available yet.' : 'Upgrade to PRO to access premium resources.'}
              </p>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Full Name</span>
              <span className="text-gray-900">{session.user.name || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Email Address</span>
              <span className="text-gray-900">{session.user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Account Role</span>
              <span className="text-gray-900">{session.user.role || "USER"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Subscription Plan</span>
              <span className="text-gray-900">{session.user.plan || "FREE"}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">Member Since</span>
              <span className="text-gray-900">
                {new Date(session.user.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
