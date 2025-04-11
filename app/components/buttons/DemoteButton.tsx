import { useState } from 'react';

interface DemoteButtonProps {
    member_id: number;
    isSuper?: boolean;
    onDemote?: () => void;
}

export default function DemoteButton({ member_id, isSuper = false, onDemote }: DemoteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDemote = async () => {
        const userType = isSuper ? 'super-admin' : 'admin';
        if (!confirm(`Are you sure you want to remove this ${userType}? They will become a regular user.`)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/demote-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ member_id }),
            });

            if (!response.ok) {
                throw new Error(`Failed to remove ${userType}`);
            }

            alert(`Successfully removed ${userType}`);
            if (onDemote) {
                onDemote();
            }
        } catch (error) {
            console.error(`Error removing ${userType}:`, error);
            alert(`Failed to remove ${userType}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDemote}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
        >
            {isLoading ? 'Removing...' : 'Remove'}
        </button>
    );
} 