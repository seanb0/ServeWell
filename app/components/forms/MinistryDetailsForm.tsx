'use client';

import { useState } from 'react';

export default function MinistryDetailsForm() {
  const [ministryName, setMinistryName] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear any previous messages
  
    // Validate and parse the budget
    const parsedBudget = parseFloat(budget);
    if (isNaN(parsedBudget)) {
      setMessage('Please enter a valid number for the budget.');
      return;
    }
  
    try {
      const response = await fetch('/api/update-ministry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ministryName, budget: parsedBudget, description }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update ministry details');
      }
  
      const data = await response.json();
      setMessage(data.message || 'Ministry details updated successfully');
      // Clear the form fields
      setMinistryName('');
      setBudget('');
      setDescription('');
      
    } catch (error: any) {
      console.error('Error updating ministry details:', error);
      setMessage(error.message || 'An error occurred');
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ministryName" className="block text-gray-700 text-lg font-bold mb-2">Ministry Name</label>
          <input
            type="text"
            id="ministryName"
            value={ministryName}
            onChange={(e) => setMinistryName(e.target.value)}
            className="mt-1 block w-full p-2 border rounded bg-gray-100 text-gray-700"
            required
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-gray-700 text-lg font-bold mb-2">Budget</label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 block w-full p-2 border rounded bg-gray-100 text-gray-700"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-700 text-lg font-bold mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border rounded bg-gray-100 text-gray-700"
            rows={4}
            required
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
          Save Changes
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}