'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, Trash2, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import { LeadDetailModal } from '../../../components/LeadDetailModal';

export default function AdminLeads() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

    fetchLeads();
  }, [session, status, router]);

  async function fetchLeads() {
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      setLeads(data.leads || []);
      setStats(data.stats || { total: 0, new: 0, contacted: 0, resolved: 0 });
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(id, status) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchLeads();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  }

  async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchLeads();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'all') return true;
    return lead.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      NEW: { color: 'bg-blue-100 text-blue-800', icon: Mail, label: 'New' },
      CONTACTED: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Contacted' },
      RESOLVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
    };
    return badges[status] || badges.NEW;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Lead Management</h1>
          <p className="text-gray-600 mt-1">Manage and respond to contact form submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('NEW')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'NEW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              New ({stats.new})
            </button>
            <button
              onClick={() => setFilter('CONTACTED')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'CONTACTED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Contacted ({stats.contacted})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'RESOLVED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Resolved ({stats.resolved})
            </button>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leads found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const badge = getStatusBadge(lead.status);
                const Icon = badge.icon;
                
                return (
                  <div
                    key={lead.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {lead.fullName}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color} flex items-center gap-1`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>Email:</strong>{' '}
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                              {lead.email}
                            </a>
                          </p>
                          {lead.company && (
                            <p>
                              <strong>Company:</strong> {lead.company}
                            </p>
                          )}
                          <p>
                            <strong>Date:</strong> {new Date(lead.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-3 text-gray-700 line-clamp-2">{lead.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lead Detail Modal */}
        <LeadDetailModal 
          lead={selectedLead} 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false);
            setSelectedLead(null);
          }}
          onStatusChange={async (id, status) => {
            await updateLeadStatus(id, status);
            setShowModal(false);
            setSelectedLead(null);
          }}
        />

      </div>
    </AdminLayout>
  );
}
