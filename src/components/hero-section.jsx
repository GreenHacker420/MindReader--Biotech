"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
           <img
  src="/logo3.png" // make sure it's in the public folder
  alt="Smarter Biotech Logo"
  className="
    w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96  /* Responsive sizing */
    rounded-xl                          /* Rounded edges */
    shadow-lg                             /* Subtle shadow for depth */
    transition-transform transition-shadow duration-300 ease-in-out /* Smooth hover effect */
    hover:scale-105                       /* Slightly grow on hover */
    hover:shadow-2xl                      /* Shadow becomes bigger on hover */
    object-contain
  "
/>

          </motion.div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#003049] leading-tight">
            Smarter Biotech,
            <br />
            <span className="text-[#2ec4b6]">Better Markets Decision</span>
          </h1>

          
          {/* CTA Button */}
          <div className="mt-12">
            <Link
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Start Your Journey
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="mt-6">
          </div>
        </motion.div>
      </div>
    </section>
  );
}
