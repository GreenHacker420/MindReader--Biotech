"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Download, Lock, Filter, Search, Eye, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../components/toast";
import { DatasetCard } from "../../components/datasets/DatasetCard";

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, FREE, PRO
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const isPro = session?.user?.plan === 'PRO';
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    fetchResources();
  }, [status, router, filter, fileTypeFilter]);

  async function fetchResources() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'FREE') params.append('accessLevel', 'FREE');
      if (filter === 'PRO') params.append('accessLevel', 'PRO');
      if (fileTypeFilter !== 'ALL') params.append('fileType', fileTypeFilter);

      const [resourcesRes, datasetsRes] = await Promise.all([
        fetch(`/api/resources?${params.toString()}`),
        fetch(`/api/datasets?${params.toString()}`),
      ]);

      const resourcesData = await resourcesRes.json();
      const datasetsData = await datasetsRes.json();

      if (resourcesRes.ok) {
        setResources(resourcesData.resources || []);
      }
      if (datasetsRes.ok) {
        setDatasets(datasetsData.datasets || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(resource) {
    if (resource.accessLevel === 'PRO' && !isPro) {
      router.push('/pricing');
      showToast('Upgrade to PRO to access this resource', 'warning');
      return;
    }

    try {
      window.open(resource.fileUrl, '_blank');
      showToast('Download started', 'success');
    } catch (error) {
      showToast('Failed to download resource', 'error');
    }
  }

  // Filter resources by search query
  const filteredResources = resources.filter((resource) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      (resource.description && resource.description.toLowerCase().includes(query))
    );
  });

  const filteredDatasets = datasets.filter((dataset) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dataset.title.toLowerCase().includes(query) ||
      (dataset.description && dataset.description.toLowerCase().includes(query))
    );
  });

  const allItems = [...filteredResources, ...filteredDatasets];

  // Get unique file types
  const fileTypes = ['ALL', ...new Set(resources.map(r => r.fileType.toUpperCase()))];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
          <p className="text-gray-600">
            Access exclusive biotech research files, datasets, and premium content
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Access Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">All Access</option>
                <option value="FREE">Free</option>
                <option value="PRO">PRO</option>
              </select>
            </div>

            {/* File Type Filter */}
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {fileTypes.map((type) => (
                <option key={type} value={type === 'ALL' ? 'ALL' : type.toLowerCase()}>
                  {type === 'ALL' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources & Datasets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resources...</p>
          </div>
        ) : allItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resources */}
            {filteredResources.map((resource) => {
              const isLocked = resource.accessLevel === 'PRO' && !isPro;
              return (
                <div
                  key={resource.id}
                  className={`relative bg-white rounded-lg shadow-lg p-6 transition-all ${
                    isLocked ? 'opacity-75' : 'hover:shadow-xl'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <div className="text-center p-4">
                        <Lock className="w-12 h-12 text-white mx-auto mb-3" />
                        <p className="text-white font-semibold mb-2">PRO Resource</p>
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
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      resource.accessLevel === 'PRO' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        resource.accessLevel === 'PRO' ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
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
                    </div>
                    <div className="flex items-center gap-2">
                      {!isLocked && (resource.fileType === 'pdf' || resource.fileType === 'excel' || resource.fileType === 'xlsx' || resource.fileType === 'csv') && (
                        <Link
                          href={`/resources/${resource.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Link>
                      )}
                      <button
                        onClick={() => handleDownload(resource)}
                        disabled={isLocked}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                          isLocked
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        {isLocked ? 'Locked' : 'Download'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Datasets */}
            {filteredDatasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isAdmin={false}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search or filters' : 'No resources available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

