"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Lock, FileText } from "lucide-react";
import { useToast } from "../../../components/toast";
import { ExcelCsvViewer } from "../../../components/resource-viewers/excel-csv-viewer";
import { PdfViewer } from "../../../components/resource-viewers/pdf-viewer";
import Link from "next/link";

export default function ResourceViewerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPro = session?.user?.plan === 'PRO';
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    fetchResource();
  }, [status, router, resourceId]);

  async function fetchResource() {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}`);
      const data = await res.json();
      
      if (res.status === 403) {
        showToast('PRO subscription required to view this resource', 'warning');
        router.push('/pricing');
        return;
      }
      
      if (res.ok) {
        setResource(data.resource);
      } else {
        showToast(data.error || 'Failed to load resource', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
      showToast('Failed to load resource', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getViewerComponent() {
    if (!resource) return null;

    const fileType = resource.fileType.toLowerCase();

    // PDF Viewer
    if (fileType === 'pdf') {
      return <PdfViewer fileUrl={resource.fileUrl} title={resource.title} />;
    }

    // Excel/CSV Viewer
    if (fileType === 'excel' || fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
      return (
        <ExcelCsvViewer
          fileUrl={resource.fileUrl}
          fileType={fileType}
          title={resource.title}
        />
      );
    }

    // Default: Show download option
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">File Preview Not Available</h3>
        <p className="text-gray-600 mb-6">
          This file type ({resource.fileType}) doesn't support in-app viewing.
        </p>
        <a
          href={resource.fileUrl}
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download File
        </a>
      </div>
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource Not Found</h2>
            <p className="text-gray-600 mb-6">The resource you're looking for doesn't exist or you don't have access.</p>
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
  if (resource.accessLevel === 'PRO' && !isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Resource</h2>
            <p className="text-gray-600 mb-6">
              This resource requires a PRO subscription. Upgrade to access exclusive content.
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
                <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
                {resource.description && (
                  <p className="text-gray-600 mt-1">{resource.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    resource.accessLevel === 'PRO'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {resource.accessLevel}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {resource.fileType.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Uploaded {new Date(resource.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {getViewerComponent()}
        </div>
      </div>
    </div>
  );
}

