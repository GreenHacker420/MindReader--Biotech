"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "../../../../components/toast";
import { DatasetTable } from "../../../../components/datasets/DatasetTable";
import { DatasetToolbar } from "../../../../components/datasets/DatasetToolbar";
import { DatasetColumnModal } from "../../../../components/datasets/DatasetColumnModal";
import Link from "next/link";

export default function DatasetEditorPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id;
  const { data: session, status } = useSession();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const { showToast } = useToast();

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

    fetchDataset();
  }, [status, session, router, datasetId]);

  async function fetchDataset() {
    setLoading(true);
    try {
      const res = await fetch(`/api/datasets/${datasetId}`);
      if (res.ok) {
        const data = await res.json();
        setDataset(data.dataset);
      } else {
        showToast('Failed to load dataset', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch dataset:', error);
      showToast('Failed to load dataset', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!dataset) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dataset.title,
          description: dataset.description,
          accessLevel: dataset.accessLevel,
          columns: dataset.columns || [],
          rows: dataset.rows || [],
        }),
      });

      if (res.ok) {
        showToast('Dataset saved successfully', 'success');
      } else {
        showToast('Failed to save dataset', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save dataset', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleAddColumn(column) {
    setDataset({
      ...dataset,
      columns: [...(dataset.columns || []), column],
      rows: (dataset.rows || []).map(row => ({ ...row, [column.name]: '' })),
    });
  }

  function handleAddRow() {
    const newRow = {};
    (dataset.columns || []).forEach(col => {
      newRow[col.name] = '';
    });
    setDataset({
      ...dataset,
      rows: [...(dataset.rows || []), newRow],
    });
  }

  function handleCellEdit(rowIndex, columnName, value) {
    const newRows = [...(dataset.rows || [])];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: value };
    setDataset({ ...dataset, rows: newRows });
  }

  function handleRowDelete(rowIndex) {
    const newRows = (dataset.rows || []).filter((_, i) => i !== rowIndex);
    setDataset({ ...dataset, rows: newRows });
  }

  function handleColumnDelete(columnIndex) {
    const column = dataset.columns[columnIndex];
    const newColumns = dataset.columns.filter((_, i) => i !== columnIndex);
    const newRows = (dataset.rows || []).map(row => {
      const newRow = { ...row };
      delete newRow[column.name];
      return newRow;
    });
    setDataset({ ...dataset, columns: newColumns, rows: newRows });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset Not Found</h2>
            <Link
              href="/admin/datasets"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Datasets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/datasets"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <input
                  type="text"
                  value={dataset.title}
                  onChange={(e) => setDataset({ ...dataset, title: e.target.value })}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                />
                <textarea
                  value={dataset.description || ''}
                  onChange={(e) => setDataset({ ...dataset, description: e.target.value })}
                  placeholder="Add description..."
                  className="mt-2 w-full text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-3 mt-2">
                  <select
                    value={dataset.accessLevel}
                    onChange={(e) => setDataset({ ...dataset, accessLevel: e.target.value })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PRO">PRO</option>
                  </select>
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
            rows={dataset.rows || []}
            onSave={handleSave}
            isEditable={true}
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowColumnModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {(dataset.columns || []).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No columns yet. Add your first column to get started.</p>
              <button
                onClick={() => setShowColumnModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Column
              </button>
            </div>
          ) : (
            <DatasetTable
              columns={dataset.columns}
              rows={dataset.rows || []}
              isEditable={true}
              onCellEdit={handleCellEdit}
              onRowDelete={handleRowDelete}
            />
          )}
        </div>

        {/* Column Modal */}
        <DatasetColumnModal
          isOpen={showColumnModal}
          onClose={() => setShowColumnModal(false)}
          onAdd={handleAddColumn}
          existingColumns={dataset.columns || []}
        />
      </div>
    </div>
  );
}

