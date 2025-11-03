'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, Zap, Lock } from 'lucide-react';

export function SubscriptionCTA() {
  const { data: session } = useSession();
  const isPro = session?.user?.plan === 'PRO';

  if (isPro) {
    return null; // Don't show CTA if already subscribed
  }

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-300" />
          <span className="text-yellow-300 font-semibold">Limited Time Offer</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Unlock Premium Biotech Intelligence
        </h2>

        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get exclusive access to advanced datasets, research articles, and market analysis tools.
          Join hundreds of biotech professionals making smarter investment decisions.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl font-bold mb-2">$12</div>
            <p className="text-blue-100">per month</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 text-white border-2 border-yellow-300">
            <div className="text-3xl font-bold mb-2">$125</div>
            <p className="text-blue-100">per year (Save $19)</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {session ? (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Plans
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin?callbackUrl=/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign In to Subscribe
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        <p className="text-blue-100 text-sm mt-6">
          <Lock className="w-4 h-4 inline mr-2" />
          Secure payment with Stripe. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
