"use client";

import { FileSpreadsheet, Lock, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function DatasetCard({ dataset, isAdmin = false, onDelete }) {
  const isLocked = dataset.accessLevel === 'PRO' && !isAdmin;

  return (
    <div className={`relative bg-white rounded-lg shadow-lg p-6 transition-all ${
      isLocked ? 'opacity-75' : 'hover:shadow-xl'
    }`}>
      {isLocked && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <Lock className="w-12 h-12 text-white mx-auto mb-3" />
            <p className="text-white font-semibold mb-2">PRO Dataset</p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Upgrade to PRO
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{dataset.title}</h3>
          {dataset.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{dataset.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${
            dataset.accessLevel === 'PRO'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {dataset.accessLevel}
          </span>
          <span className="text-xs text-gray-500">
            {Array.isArray(dataset.rows) ? dataset.rows.length : 0} rows
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isLocked && (
            <>
              {isAdmin ? (
                <>
                  <Link
                    href={`/admin/datasets/${dataset.id}`}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs font-medium"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(dataset.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </>
              ) : (
                <Link
                  href={`/datasets/${dataset.id}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

