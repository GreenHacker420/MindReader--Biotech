"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, FileSpreadsheet } from "lucide-react";
import { useToast } from "../../../components/toast";
import { DatasetTable } from "../../../components/datasets/DatasetTable";
import { DatasetToolbar } from "../../../components/datasets/DatasetToolbar";
import Link from "next/link";

export default function DatasetViewerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id;
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const isPro = session?.user?.plan === 'PRO';
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    fetchDataset();
  }, [status, router, datasetId]);

  async function fetchDataset() {
    setLoading(true);
    try {
      const res = await fetch(`/api/datasets/${datasetId}`);
      const data = await res.json();
      
      if (res.status === 403) {
        showToast('PRO subscription required to view this dataset', 'warning');
        router.push('/pricing');
        return;
      }
      
      if (res.ok) {
        setDataset(data.dataset);
      } else {
        showToast(data.error || 'Failed to load dataset', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch dataset:', error);
      showToast('Failed to load dataset', 'error');
    } finally {
      setLoading(false);
    }
  }

  const rows = dataset?.rows || [];
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = rows.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          {/* Skeleton Loading */}
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset Not Found</h2>
            <p className="text-gray-600 mb-6">The dataset you're looking for doesn't exist or you don't have access.</p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check access control
  if (dataset.accessLevel === 'PRO' && !isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Dataset</h2>
            <p className="text-gray-600 mb-6">
              This dataset requires a PRO subscription. Upgrade to access exclusive datasets.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Resources
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upgrade to PRO
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/resources"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{dataset.title}</h1>
                {dataset.description && (
                  <p className="text-gray-600 mt-1">{dataset.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    dataset.accessLevel === 'PRO'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {dataset.accessLevel}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created {new Date(dataset.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <DatasetToolbar
            title={dataset.title}
            accessLevel={dataset.accessLevel}
            columns={dataset.columns || []}
            rows={rows}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <DatasetTable
            columns={dataset.columns || []}
            rows={paginatedRows}
            isEditable={false}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, rows.length)} of {rows.length} rows
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

