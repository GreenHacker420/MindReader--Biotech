"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, FileSpreadsheet } from "lucide-react";
import { useToast } from "../../../components/toast";
import { DatasetCard } from "../../../components/datasets/DatasetCard";
import { ConfirmationDialog } from "../../../components/confirmation-dialog";

export default function AdminDatasetsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingDataset, setDeletingDataset] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    accessLevel: 'FREE',
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchDatasets();
  }, [session, status, router]);

  async function fetchDatasets() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/datasets');
      const data = await res.json();
      if (res.ok) {
        setDatasets(data.datasets || []);
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
      showToast('Failed to load datasets', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.title) {
      showToast('Please provide a title', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          accessLevel: formData.accessLevel,
          columns: [],
          rows: [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Dataset created successfully', 'success');
        setShowCreateModal(false);
        setFormData({ title: '', description: '', accessLevel: 'FREE' });
        router.push(`/admin/datasets/${data.dataset.id}`);
      } else {
        showToast(data.error || 'Failed to create dataset', 'error');
      }
    } catch (error) {
      console.error('Create dataset error:', error);
      showToast('Failed to create dataset', 'error');
    }
  }

  async function handleDelete(datasetId) {
    try {
      const res = await fetch(`/api/admin/datasets/${datasetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Dataset deleted successfully', 'success');
        setDeletingDataset(null);
        fetchDatasets();
      } else {
        showToast('Failed to delete dataset', 'error');
      }
    } catch (error) {
      console.error('Delete dataset error:', error);
      showToast('Failed to delete dataset', 'error');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dataset Management</h1>
            <p className="text-gray-600 mt-2">Create and manage datasets for users</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Dataset
          </button>
        </div>

        {/* Datasets Grid */}
        {datasets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isAdmin={true}
                onDelete={(id) => setDeletingDataset({ id, title: dataset.title })}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No datasets yet</h3>
            <p className="text-gray-600 mb-6">Create your first dataset to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Dataset
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New Dataset</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', description: '', accessLevel: 'FREE' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level *
                  </label>
                  <select
                    required
                    value={formData.accessLevel}
                    onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ title: '', description: '', accessLevel: 'FREE' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create & Edit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmationDialog
          isOpen={!!deletingDataset}
          title="Delete Dataset"
          message={`Are you sure you want to delete "${deletingDataset?.title}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingDataset?.id)}
          onCancel={() => setDeletingDataset(null)}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}

