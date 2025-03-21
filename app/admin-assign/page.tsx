'use client'; // This must be at the top to ensure it's a client component

import '@/app/globals.css';
import MinistryDropdown from '../components/buttons/MinistryDropdown';
import { useEffect, useState } from 'react';
import SuperAdminsList from '../components/SuperAdminsList';

export default function AdminAssignPage() {
    const [admins, setAdmins] = useState([]);
    
    // Form state variables
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch('/api/admin', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch admins');
                }

                const data = await response.json();
                console.log('Fetched admins:', data);
                setAdmins(data);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        fetchAdmins();
    }, []);

    // Function to handle super-admin creation
    const handleCreateSuperAdmin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');
        setFormSuccess('');

        try {
            const response = await fetch('/api/admin/create-super-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create super-admin');
            }

            // Success - clear form and show success message
            setFormSuccess('Super-admin created successfully!');
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setPassword('');
            
            // Refresh the admin list
            const adminResponse = await fetch('/api/admin');
            const adminData = await adminResponse.json();
            setAdmins(adminData);
            
            // Close modal after a short delay
            setTimeout(() => {
                setShowCreateSuperAdminModal(false);
                setFormSuccess('');
            }, 2000);
            
        } catch (error) {
            console.error('Error creating super-admin:', error);
            setFormError(error.message || 'Failed to create super-admin');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add this new function to handle admin deletion
    const handleDeleteAdmin = async (memberId) => {
        if (!confirm("Are you sure you want to delete this admin?")) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/delete-admin`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ memberId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete admin');
            }

            // Remove the deleted admin from the state
            setAdmins(admins.filter(admin => admin.member_id !== memberId));
            alert('Admin deleted successfully');
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert(`Error: ${error.message || 'Failed to delete admin'}`);
        }
    };

    return (
        <section className="mt-20 min-h-screen flex flex-col">
            <div className="mt-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
                <div className="flex flex-col items-center justify-center pt-8">
                    <h2 className="text-2xl font-bold text-white mb-8">Admin Assignment Page</h2>
                </div>
                
                {/* Super Admins List Section */}
                <div className="container mx-auto px-4 mb-8">
                    <SuperAdminsList />
                </div>
                
                <div className="items-center justify-center">
                    <table className="table-auto flex-initial w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-200">
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Assignment Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <tr key={admin.member_id}>
                                        <td>{admin.fname}</td>
                                        <td>{admin.lname}</td>
                                        <td>{admin.email}</td>
                                        <td>{admin.memberphone}</td>
                                        <td>
                                            {admin.Ministry_ID !== null? (
                                                <div className="px-4 py-2 bg-green-500 text-white rounded-lg w-32 inline-block text-center">
                                                    Assigned
                                                </div>    
                                            ) : (
                                                <MinistryDropdown member_id={admin.member_id} />
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.member_id)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-4 text-gray-500">No unassigned admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
