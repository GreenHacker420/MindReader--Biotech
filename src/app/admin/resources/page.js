"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload, FileText, Trash2, Edit, X, Save, Plus } from "lucide-react";
import { useToast } from "../../../components/toast";
import { ConfirmationDialog } from "../../../components/confirmation-dialog";

export default function AdminResourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deletingResource, setDeletingResource] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileType: 'pdf',
    accessLevel: 'FREE',
    file: null,
    fileUrl: '',
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

    fetchResources();
  }, [session, status, router]);

  async function fetchResources() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resources');
      const data = await res.json();
      if (res.ok) {
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file) {
    setUploading(true);
    try {
      // For now, we'll use a simple approach - you can integrate with S3, Cloudinary, etc.
      // Here we'll create a data URL or use a service
      const formData = new FormData();
      formData.append('file', file);
      
      // You can add your file upload service here (S3, Cloudinary, etc.)
      // For demo purposes, we'll use a placeholder
      const fileUrl = URL.createObjectURL(file);
      
      // In production, upload to your storage service and get the URL
      // const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      // const uploadData = await uploadRes.json();
      // const fileUrl = uploadData.url;

      setUploading(false);
      return fileUrl;
    } catch (error) {
      console.error('File upload error:', error);
      showToast('Failed to upload file', 'error');
      setUploading(false);
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.title || !formData.fileType || !formData.accessLevel) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    let fileUrl = formData.fileUrl;

    // If a new file is uploaded
    if (formData.file && !editingResource) {
      fileUrl = await handleFileUpload(formData.file);
      if (!fileUrl) return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('description', formData.description || '');
      dataToSend.append('fileType', formData.fileType);
      dataToSend.append('accessLevel', formData.accessLevel);
      dataToSend.append('fileUrl', fileUrl);

      const url = editingResource
        ? `/api/admin/resources/${editingResource.id}`
        : '/api/admin/resources';

      const res = await fetch(url, {
        method: editingResource ? 'PATCH' : 'POST',
        body: editingResource ? JSON.stringify({
          title: formData.title,
          description: formData.description,
          fileType: formData.fileType,
          accessLevel: formData.accessLevel,
          fileUrl: fileUrl,
        }) : dataToSend,
        headers: editingResource ? { 'Content-Type': 'application/json' } : {},
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          editingResource ? 'Resource updated successfully' : 'Resource created successfully',
          'success'
        );
        setShowUploadModal(false);
        setEditingResource(null);
        resetForm();
        fetchResources();
      } else {
        showToast(data.error || 'Failed to save resource', 'error');
      }
    } catch (error) {
      console.error('Save resource error:', error);
      showToast('Failed to save resource', 'error');
    }
  }

  async function handleDelete(resourceId) {
    try {
      const res = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Resource deleted successfully', 'success');
        setDeletingResource(null);
        fetchResources();
      } else {
        showToast('Failed to delete resource', 'error');
      }
    } catch (error) {
      console.error('Delete resource error:', error);
      showToast('Failed to delete resource', 'error');
    }
  }

  function handleEdit(resource) {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      fileType: resource.fileType,
      accessLevel: resource.accessLevel,
      file: null,
      fileUrl: resource.fileUrl,
    });
    setShowUploadModal(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      fileType: 'pdf',
      accessLevel: 'FREE',
      file: null,
      fileUrl: '',
    });
    setEditingResource(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
            <p className="text-gray-600 mt-2">Upload and manage premium resources for users</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowUploadModal(true);
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Upload Resource
          </button>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{resource.title}</div>
                        {resource.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {resource.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {resource.fileType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        resource.accessLevel === 'PRO'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {resource.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(resource.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingResource(resource)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No resources uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload/Edit Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingResource ? 'Edit Resource' : 'Upload New Resource'}
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Type *
                    </label>
                    <select
                      required
                      value={formData.fileType}
                      onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel (XLSX)</option>
                      <option value="csv">CSV</option>
                      <option value="docx">Word (DOCX)</option>
                    </select>
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
                </div>

                {!editingResource && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        required={!editingResource}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Auto-detect file type
                            const fileName = file.name.toLowerCase();
                            let detectedType = 'pdf';
                            
                            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                              detectedType = 'excel';
                            } else if (fileName.endsWith('.csv')) {
                              detectedType = 'csv';
                            } else if (fileName.endsWith('.pdf')) {
                              detectedType = 'pdf';
                            } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                              detectedType = 'docx';
                            }
                            
                            setFormData({
                              ...formData,
                              file: file,
                              fileType: detectedType,
                            });
                          }
                        }}
                        accept=".pdf,.xlsx,.xls,.csv,.docx,.doc"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                    {formData.file && (
                      <p className="mt-2 text-xs text-gray-500">
                        Detected type: {formData.fileType.toUpperCase()}
                      </p>
                    )}
                  </div>
                )}

                {editingResource && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File URL
                    </label>
                    <input
                      type="url"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        {editingResource ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {editingResource ? 'Update' : 'Upload'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmationDialog
          isOpen={!!deletingResource}
          title="Delete Resource"
          message={`Are you sure you want to delete "${deletingResource?.title}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingResource?.id)}
          onCancel={() => setDeletingResource(null)}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}

