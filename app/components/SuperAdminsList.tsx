'use client';

import { useEffect, useState } from 'react';

export default function SuperAdminsList() {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/get-super-admins');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch super-admins');
      }
      
      const data = await response.json();
      setSuperAdmins(data);
    } catch (err) {
      console.error('Error in component:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const response = await fetch('/api/admin/get-admin-candidates');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch candidates');
      }
      
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      alert(`Error: ${err.message || 'Failed to fetch candidates'}`);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleAssignSuperAdmin = async (memberId) => {
    try {
      const response = await fetch('/api/admin/assign-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign super-admin');
      }

      // Refresh the list after successful assignment
      await fetchSuperAdmins();
      setShowAssignModal(false);
      alert('Super-admin assigned successfully');
    } catch (err) {
      console.error('Error assigning super-admin:', err);
      alert(`Error: ${err.message || 'Failed to assign super-admin'}`);
    }
  };

  const openAssignModal = () => {
    fetchCandidates();
    setShowAssignModal(true);
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const handleDelete = async (superadminId, memberId) => {
    if (!confirm('Are you sure you want to delete this super-admin?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-super-admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          superadminId,
          memberId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete super-admin');
      }

      // Refresh the list after successful deletion
      await fetchSuperAdmins();
      alert('Super-admin deleted successfully');
    } catch (err) {
      console.error('Error deleting super-admin:', err);
      alert(`Error: ${err.message || 'Failed to delete super-admin'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Super Administrators</h3>
        <button 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          onClick={openAssignModal}
        >
          Assign Super Admin
        </button>
      </div>
      
      {loading ? (
        <p className="text-center py-4">Loading super-admins...</p>
      ) : error ? (
        <div className="text-center text-red-500 py-4">
          <p>Error: {error}</p>
        </div>
      ) : superAdmins.length === 0 ? (
        <p className="text-center py-4">No super-admins found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Phone</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {superAdmins.map((admin) => (
                <tr key={admin.superadmin_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{admin.superadmin_id}</td>
                  <td className="py-2 px-4 border-b">{`${admin.fname} ${admin.lname}`}</td>
                  <td className="py-2 px-4 border-b">{admin.email}</td>
                  <td className="py-2 px-4 border-b">{admin.memberphone}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      admin.activity_status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.activity_status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button 
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg shadow-md transition duration-300"
                      onClick={() => handleDelete(admin.superadmin_id, admin.member_id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for assigning super admin */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Assign Super Admin</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAssignModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingCandidates ? (
              <p className="text-center py-4">Loading candidates...</p>
            ) : candidates.length === 0 ? (
              <p className="text-center py-4">No candidates available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">First Name</th>
                      <th className="py-2 px-4 border-b text-left">Last Name</th>
                      <th className="py-2 px-4 border-b text-left">Email</th>
                      <th className="py-2 px-4 border-b text-left">Phone</th>
                      <th className="py-2 px-4 border-b text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate.member_id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{candidate.fname}</td>
                        <td className="py-2 px-4 border-b">{candidate.lname}</td>
                        <td className="py-2 px-4 border-b">{candidate.email}</td>
                        <td className="py-2 px-4 border-b">{candidate.phone}</td>
                        <td className="py-2 px-4 border-b">
                          <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg shadow-md transition duration-300"
                            onClick={() => handleAssignSuperAdmin(candidate.member_id)}
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button 
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 