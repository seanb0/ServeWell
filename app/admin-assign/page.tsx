'use client'; // This must be at the top to ensure it's a client component

import '@/app/globals.css';
import MinistryDropdown from '../components/buttons/MinistryDropdown';
import RejectButton from '@/app/components/buttons/RejectButton';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AdminAssignPage() {
    const [admins, setAdmins] = useState([]);
    const { user } = useUser();
    const auth0ID = user?.sub;

    useEffect(() => {
        if (!auth0ID) {
            return;
        }
        const fetchAdmins = async () => {
            try {
                const response = await fetch('/api/admin/request-admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ auth0ID: auth0ID }),
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
    }, [auth0ID]);

    return (
        <section className="mt-20 min-h-screen flex flex-col">
            <div className="mt-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
                <div className="flex flex-col items-center justify-center pt-8">
                    <h2 className="text-2xl font-bold text-white mb-8">Admin Assignment Page</h2>
                </div>
                
                <div className="items-center justify-center">
                    <table className="table-auto flex-initial w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-200">
                                <th>First Name</th>
                                <th>Email</th>
                                <th>Assignment Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <tr key={admin.member_id}>
                                        <td>{admin.fname}</td>
                                        <td>{admin.email}</td>
                                        <td>
                                            {admin.minID !== null? (
                                                <div className="px-4 py-2 bg-green-500 text-white rounded-lg w-32 inline-block text-center">
                                                    Assigned
                                                </div>    
                                            ) : (
                                                <MinistryDropdown member_id={admin.member_id} />
                                            )}
                                            {admin.church_id !== null? (
                                                <div className="px-4 py-2 bg-green-500 text-white rounded-lg w-32 inline-block text-center">
                                                    Accepted
                                                </div>    
                                            ) : (
                                                <RejectButton member_id={admin.member_id} />
                                            )}
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
