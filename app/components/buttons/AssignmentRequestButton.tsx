'use client';

import { useState, useEffect, useRef } from "react";
import { useUser } from '@auth0/nextjs-auth0/client';

// this button in invoked when a user wants to request an assignment to a church
// it fetches the list of churches from the database and allows the user to select one

// when the user clicks that church on the dropdown, the user's request and the church id are sent to the
// requestingAdmins table in the database

interface Church {
  church_id: number;
  churchname: string;
}

export default function AssignmentRequestButton() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    async function fetchChurches() {
      try {
        const response = await fetch("/api/churches", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log(data);
        setChurches(data);
      } catch (error) {
        console.error("Failed to load churches", error);
      }
    }

    fetchChurches();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  async function updateRequestAdmin(church: Church) {
    setLoading(true);
    try {
      console.log("ChurchID & UserID: ", church.church_id, user?.sub);
      const response = await fetch("/api/requestingAdmins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchID: church.church_id, auth0ID: user?.sub }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setSelectedChurch(church);
      } else {
        console.error("Error updating requesting admin", data.error);
      }
    } catch (error) {
      console.error("Failed to update requesting admin", error);
    }
    setLoading(false);
  }

  return (
    <div ref={dropdownRef} className="bg-blue-600 text-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105 hover:bg-blue-700">
      <button 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-bold mb-2">
        {loading ? "Updating..." : selectedChurch ? "Request Sent!" : "Request Assignment"}
        </h3>
      </button>

      {isOpen && (
        <div className="absolute top-0 left-full ml-2 w-64 mt-2 bg-white text-black rounded-lg shadow-lg">
            {churches.map((church) => (
              <div 
                key={church.church_id} 
                className="p-2 hover:bg-gray-100"
                  onClick={() => {
                    updateRequestAdmin(church);
                    setIsOpen(false);
                  }}
                >
                  {church.churchname}
                </div>
            ))}
        </div>
      )}
    </div>
  );    
}
