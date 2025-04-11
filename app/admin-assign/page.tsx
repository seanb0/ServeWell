'use client'; // This must be at the top to ensure it's a client component

import '@/app/globals.css';
import MinistryDropdown from '../components/buttons/MinistryDropdown';
import RejectButton from '@/app/components/buttons/RejectButton';
import PromoteSuperAdminButton from '../components/buttons/PromoteSuperAdminButton';
import DemoteButton from '../components/buttons/DemoteButton';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface Admin {
    member_id: number;
    fname: string;
    email: string;
    minID: number | null;
    church_id: number | null;
}

interface SuperAdmin {
    member_id: number;
    fname: string;
    email: string;
}

export default function AdminAssignPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
    const { user } = useUser();
    const auth0ID = user?.sub;

    const fetchSuperAdmins = async () => {
        if (!auth0ID) return;
        
        try {
            const response = await fetch('/api/admin/get-super-admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ auth0ID: auth0ID }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch super admins');
            }

            const data = await response.json();
            console.log('Fetched super admins:', data);
            setSuperAdmins(data);
        } catch (error) {
            console.error('Error fetching super admins:', error);
        }
    };

    const refreshAdmins = async () => {
        if (!auth0ID) return;
        
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
            // Refresh super admins list as well when an admin is promoted
            fetchSuperAdmins();
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    };

    useEffect(() => {
        refreshAdmins();
        fetchSuperAdmins();
    }, [auth0ID]);

    return (
        <section className="mt-20 min-h-screen flex flex-col">
            <div className="mt-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
                <div className="flex flex-col items-center justify-center pt-8">
                    <h2 className="text-2xl font-bold text-white mb-8">Admin Assignment Page</h2>
                </div>

                {/* Super Admins Section */}
                <div className="items-center justify-center mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Super Administrators</h3>
                    <table className="table-auto flex-initial w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {superAdmins.length > 0 ? (
                                superAdmins.map((superAdmin) => (
                                    <tr key={superAdmin.member_id}>
                                        <td className="px-4 py-2">{superAdmin.fname}</td>
                                        <td className="px-4 py-2">{superAdmin.email}</td>
                                        <td className="px-4 py-2">
                                            <DemoteButton 
                                                member_id={superAdmin.member_id}
                                                isSuper={true}
                                                onDemote={refreshAdmins}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-4 text-gray-500">No super administrators found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Regular Admins Section */}
                <div className="items-center justify-center">
                    <h3 className="text-xl font-bold text-white mb-4">Regular Administrators</h3>
                    <table className="table-auto flex-initial w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2">First Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <tr key={admin.member_id}>
                                        <td className="px-4 py-2">{admin.fname}</td>
                                        <td className="px-4 py-2">{admin.email}</td>
                                        <td className="px-4 py-2">
                                            {admin.minID !== null ? (
                                                <div className="px-4 py-2 bg-green-500 text-white rounded-lg w-32 inline-block text-center">
                                                    Assigned
                                                </div>    
                                            ) : (
                                                <MinistryDropdown member_id={admin.member_id} />
                                            )}
                                            {admin.church_id !== null ? (
                                                <div className="px-4 py-2 bg-green-500 text-white rounded-lg w-32 inline-block text-center ml-2">
                                                    Accepted
                                                </div>    
                                            ) : (
                                                <RejectButton member_id={admin.member_id} />
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <PromoteSuperAdminButton 
                                                member_id={admin.member_id} 
                                                onPromote={refreshAdmins}
                                            />
                                            <DemoteButton 
                                                member_id={admin.member_id}
                                                onDemote={refreshAdmins}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-4 text-gray-500">No unassigned admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
