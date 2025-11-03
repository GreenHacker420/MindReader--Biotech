'use client';

import { useState } from 'react';
import { X, Mail, Building, MessageSquare, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export function LeadDetailModal({ lead, isOpen, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !lead) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(lead.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const statusColors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.fullName}</h2>
            <p className="text-sm text-gray-600 mt-1">Contact Lead</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
              {lead.status}
            </span>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <p className="text-gray-900">{lead.email}</p>
          </div>

          {/* Company */}
          {lead.company && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company
              </label>
              <p className="text-gray-900">{lead.company}</p>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message
            </label>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{lead.message}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Submitted
              </label>
              <p className="text-gray-900">
                {new Date(lead.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {lead.repliedAt && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Replied
                </label>
                <p className="text-gray-900">
                  {new Date(lead.repliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleStatusChange('CONTACTED')}
              disabled={updating || lead.status === 'CONTACTED'}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {updating ? 'Updating...' : 'Mark as Contacted'}
            </button>
            <button
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={updating || lead.status === 'RESOLVED'}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {updating ? 'Updating...' : 'Mark as Resolved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
