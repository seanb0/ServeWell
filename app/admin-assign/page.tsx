'use client'; // This must be at the top to ensure it's a client component

import '@/app/globals.css';
import MinistryDropdown from '../components/buttons/MinistryDropdown';
import { useEffect, useState } from 'react';
import SuperAdminsList from '../components/SuperAdminsList';

export default function AdminAssignPage() {
    const [admins, setAdmins] = useState([]);
    const [showCreateSuperAdminModal, setShowCreateSuperAdminModal] = useState(false);
    
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

    return (
        <section className="mt-20 min-h-screen flex flex-col">
            <div className="mt-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
                <div className="flex flex-col items-center justify-center pt-8">
                    <h2 className="text-2xl font-bold text-white mb-8">Admin Assignment Page</h2>
                    <button 
                        onClick={() => setShowCreateSuperAdminModal(true)}
                        className="mb-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
                    >
                        Create Super-Admin
                    </button>
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-4 text-gray-500">No unassigned admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Super Admin Creation Modal */}
                {showCreateSuperAdminModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                            <h3 className="text-xl font-bold mb-4">Create Super-Admin</h3>
                            <button 
                                onClick={() => setShowCreateSuperAdminModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                            
                            {formError && (
                                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {formError}
                                </div>
                            )}
                            
                            {formSuccess && (
                                <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                                    {formSuccess}
                                </div>
                            )}
                            
                            <form className="space-y-4" onSubmit={handleCreateSuperAdmin}>
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input 
                                        type="text" 
                                        id="firstName" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input 
                                        type="text" 
                                        id="lastName" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        id="phone" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div className="flex justify-end mt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreateSuperAdminModal(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`${isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-2 px-4 rounded`}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
