"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MessageDialog from '@/components/ui/MessageDialog';
import type { MessageType } from '@/types/ui';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gender?: string;
  birthdate?: string;
  firstTime: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Assessment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  symptoms: Array<{
    name: string;
    selected: boolean;
  }>;
  totalScore: number;
  analysis: string;
  createdAt: string;
}

interface AnalysisData {
  totalAssessments: number;
  uniqueUsers: number;
  averageScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  commonSymptoms: Array<{
    name: string;
    count: number;
    percentage: string;
  }>;
  timeAnalysis: Array<{
    date: string;
    count: number;
    averageScore: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'assessments' | 'analytics'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MessageType>('info');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);

  const showDialog = useCallback((type: MessageType, message: string, title?: string) => {
    setDialogType(type);
    setDialogMessage(message);
    setDialogTitle(title);
    setDialogOpen(true);
  }, []);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/users?limit=1');
        if (!response.ok) {
          if (response.status === 403) {
            showDialog('error', 'Admin access required. You will be redirected to the home page.', 'Access Denied');
            setTimeout(() => router.push('/'), 2000);
            return;
          }
          throw new Error('Failed to verify admin access');
        }
        setLoading(false);
      } catch (error) {
        showDialog('error', 'Failed to verify admin access');
        setTimeout(() => router.push('/'), 2000);
      }
    };

    checkAdminAccess();
  }, [router, showDialog]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '50');

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.data.users);
    } catch (error) {
      showDialog('error', 'Failed to fetch users');
    }
  }, [searchTerm, showDialog]);

  const fetchAssessments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      params.append('limit', '100');

      const response = await fetch(`/api/admin/assessments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      
      const data = await response.json();
      setAssessments(data.data.assessments);
      setAnalysis(data.data.analysis);
    } catch (error) {
      showDialog('error', 'Failed to fetch assessments');
    }
  }, [selectedUserId, showDialog]);

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [fetchUsers, loading]);

  useEffect(() => {
    if (!loading && activeTab === 'assessments') {
      fetchAssessments();
    }
  }, [fetchAssessments, loading, activeTab]);

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Failed to update user');
      
      showDialog('success', 'User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      showDialog('error', 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      showDialog('success', 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      showDialog('error', 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center">
        <p className="text-lg">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6ECD9] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-md">
          {[
            { key: 'users', label: 'User Management' },
            { key: 'assessments', label: 'Assessment History' },
            { key: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">Joined</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.phone || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assessment History</h2>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold">User</th>
                    <th className="px-4 py-3 text-left font-semibold">Score</th>
                    <th className="px-4 py-3 text-left font-semibold">Risk Level</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Symptoms</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{assessment.user.name}</div>
                          <div className="text-sm text-gray-500">{assessment.user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{assessment.totalScore}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assessment.totalScore < 30 ? 'bg-green-100 text-green-800' :
                          assessment.totalScore < 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assessment.totalScore < 30 ? 'Low' : assessment.totalScore < 60 ? 'Medium' : 'High'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {assessment.symptoms?.filter(s => s.selected).length || 0} symptoms
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analysis && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700">Total Assessments</h3>
                <p className="text-3xl font-bold text-blue-600">{analysis.totalAssessments}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700">Unique Users</h3>
                <p className="text-3xl font-bold text-green-600">{analysis.uniqueUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
                <p className="text-3xl font-bold text-orange-600">{analysis.averageScore}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700">High Risk</h3>
                <p className="text-3xl font-bold text-red-600">{analysis.riskDistribution.high}</p>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Risk Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.riskDistribution.low}</div>
                  <div className="text-sm text-gray-600">Low Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.riskDistribution.medium}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analysis.riskDistribution.high}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
              </div>
            </div>

            {/* Common Symptoms */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Most Common Symptoms</h3>
              <div className="space-y-2">
                {analysis.commonSymptoms.slice(0, 10).map((symptom, index) => (
                  <div key={symptom.name} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{index + 1}. {symptom.name}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{symptom.count} occurrences</span>
                      <span className="ml-2 text-sm font-medium">({symptom.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Edit User</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userData = {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  role: formData.get('role') as string,
                  phone: formData.get('phone') as string,
                  gender: formData.get('gender') as string,
                };
                handleUpdateUser(editingUser._id, userData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      name="name"
                      defaultValue={editingUser.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingUser.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      name="role"
                      defaultValue={editingUser.role}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      name="phone"
                      defaultValue={editingUser.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      name="gender"
                      defaultValue={editingUser.gender || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <MessageDialog
          open={dialogOpen}
          type={dialogType}
          title={dialogTitle}
          message={dialogMessage}
          onClose={() => setDialogOpen(false)}
        />
      </div>
    </div>
  );
}
