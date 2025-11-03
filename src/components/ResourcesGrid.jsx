'use client';

import { FileText, Lock, Eye, Database, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export function ResourcesGrid({ resources, datasets, isPro, onViewResource, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  const allItems = [...resources, ...datasets];

  if (allItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No resources found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allItems.map((item) => {
        const isDataset = 'category' in item;
        const isLocked = item.accessLevel === 'PRO' && !isPro;
        const icon = isDataset ? Database : FileText;
        const Icon = icon;

        return (
          <div
            key={item.id}
            className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {isDataset ? 'Dataset' : 'Resource'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>
                {isLocked && (
                  <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description || 'No description available'}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {item.fileType && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {item.fileType}
                  </span>
                )}
                {item.category && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {item.category}
                  </span>
                )}
                {item.createdAt && (
                  <span className="px-2 py-1 bg-gray-100 rounded flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Access Level Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.accessLevel === 'PRO'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.accessLevel === 'PRO' ? 'Premium' : 'Free'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              {isLocked ? (
                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded hover:shadow-lg transition-shadow"
                >
                  <Lock className="w-4 h-4" />
                  Upgrade to Access
                </Link>
              ) : (
                <button
                  onClick={() => onViewResource(item)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Resource
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
