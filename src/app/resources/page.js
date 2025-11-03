"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Lock, Filter, Search, Eye, FileSpreadsheet, Database } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../components/toast";
import { DatasetCard } from "../../components/datasets/DatasetCard";
import { Breadcrumb } from "../../components/Breadcrumb";
import { ResourcesGrid } from "../../components/ResourcesGrid";

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

  function handleViewResource(resource) {
    if (resource.accessLevel === 'PRO' && !isPro) {
      router.push('/pricing');
      showToast('Upgrade to PRO to access this resource', 'warning');
      return;
    }

    router.push(`/resources/${resource.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Resources & Datasets' }]} />
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Resources & Datasets</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Access exclusive biotech research files, market datasets, and premium analysis tools. 
            Explore our curated collection of resources to enhance your investment decisions.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
        <ResourcesGrid 
          resources={filteredResources} 
          datasets={filteredDatasets} 
          isPro={isPro}
          onViewResource={handleViewResource}
          loading={loading}
        />
      </div>
    </div>
  );
}

