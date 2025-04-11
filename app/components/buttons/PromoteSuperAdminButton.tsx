import { useState } from 'react';

interface PromoteSuperAdminButtonProps {
    member_id: number;
    onPromote?: () => void;
}

export default function PromoteSuperAdminButton({ member_id, onPromote }: PromoteSuperAdminButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePromote = async () => {
        if (!confirm('Are you sure you want to promote this user to super-admin?')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/promote-super-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ member_id }),
            });

            if (!response.ok) {
                throw new Error('Failed to promote user to super-admin');
            }

            alert('Successfully promoted user to super-admin');
            if (onPromote) {
                onPromote();
            }
        } catch (error) {
            console.error('Error promoting to super-admin:', error);
            alert('Failed to promote user to super-admin');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePromote}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
        >
            {isLoading ? 'Promoting...' : 'Make Super-Admin'}
        </button>
    );
} 