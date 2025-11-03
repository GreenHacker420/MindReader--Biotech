'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Monthly',
    price: 12,
    period: 'month',
    priceId: 'price_monthly',
    description: 'Perfect for flexible access',
    features: [
      'Full platform access',
      'Unlimited research articles',
      'Access to all datasets',
      'Download resources (view only)',
      'Advanced analytics',
      'Priority email support',
      'Exclusive webinars',
      'Early access to new features',
    ],
    cta: 'Subscribe Monthly',
    popular: false,
  },
  {
    name: 'Annual',
    price: 125,
    period: 'year',
    priceId: 'price_annual',
    description: 'Best value - Save $19/year',
    features: [
      'Everything in Monthly',
      'Full platform access',
      'Unlimited research articles',
      'Access to all datasets',
      'Download resources (view only)',
      'Advanced analytics',
      'Priority email support',
      'Exclusive webinars',
      'Early access to new features',
      'Annual billing discount',
    ],
    cta: 'Subscribe Annually',
    popular: true,
    savings: 'Save $19',
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userPlan = session?.user?.plan || 'FREE';
  const isPro = userPlan === 'PRO';

  async function handleSubscribe(priceId, planName) {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    if (isPro) {
      return; // Already subscribed
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: 'PRO',
          priceId,
          planName 
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.details || data.error || 'Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Unlock Premium Access
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get full access to exclusive datasets, resources, and research articles. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 md:p-10 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                  : 'bg-white shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    /{plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <p className="text-green-300 font-semibold mt-2">{plan.savings}</p>
                )}
              </div>

              <ul className="space-y-3 md:space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-green-300' : 'text-green-600'}`} />
                    <span className={`${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading || isPro}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !isPro
                    ? plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100 focus:ring-blue-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-green-500 text-white cursor-default'
                } ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading 
                  ? 'Processing...' 
                  : isPro
                  ? 'Current Plan'
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time from your dashboard. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                The Free plan is available forever with no credit card required. You can upgrade to Pro at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
