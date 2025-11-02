"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        alert(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen pt-24 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to explore biotech opportunities? Connect with our expert team for personalized insights and analysis.
          </p>
        </div>

        {/* Glass Panels */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info Panel (glass) */}
          <section className="relative rounded-2xl bg-white/30 backdrop-blur-xl ring-1 ring-white/40 shadow-xl p-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-white/10" />
            <div className="relative space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Let&apos;s start a conversation</h2>
                <p className="text-gray-700 leading-relaxed">
                  Whether you&apos;re an investor looking for biotech insights, a startup seeking market analysis, or a researcher interested in our intelligence platform, we&apos;re here to help.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-700">srishti.gupta@mindereaderbio.tech</p>
                    <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours</p>
                  </div>
                </div>

              </div>

              <div className="pt-4">
                <Link
                  href="/insights"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Join Waitlist
                </Link>
              </div>
            </div>
          </section>

          {/* Form Panel (glass) */}
          <section className="relative rounded-2xl bg-white/30 backdrop-blur-xl ring-1 ring-white/40 shadow-xl p-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-white/10" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/60 text-gray-900 placeholder-gray-500 ring-1 ring-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/60 text-gray-900 placeholder-gray-500 ring-1 ring-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-800 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/60 text-gray-900 placeholder-gray-500 ring-1 ring-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/60 text-gray-900 placeholder-gray-500 ring-1 ring-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    placeholder="Tell us about your biotech interests, investment focus, or how we can help with market analysis..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
