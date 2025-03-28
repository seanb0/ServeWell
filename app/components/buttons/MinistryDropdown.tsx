"use client";

import { useState, useEffect, useRef } from "react";

interface Ministry {
  ministry_id: number;
  ministryname: string;
}

interface MinistryDropdownProps {
  member_id: number; // Pass admin_id as a prop
}

export default function MinistryDropdown({ member_id }: MinistryDropdownProps) {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMinistries() {
      try {
        const response = await fetch("/api/ministries", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        setMinistries(data);
      } catch (error) {
        console.error("Failed to load ministries", error);
      }
    }

    fetchMinistries();
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

  async function updateAdminMinistry(ministry: Ministry) {
    setLoading(true);
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memID: member_id, minID: ministry.ministry_id }), // Pass admin_id
      });

      const data = await response.json();
      if (response.ok) {
        setSelectedMinistry(ministry);
      } else {
        console.error("Error updating ministry:", data.error);
      }
    } catch (error) {
      console.error("Failed to update ministry:", error);
    }
    setLoading(false);
  }

  return (
    <div className="relative inline-block text-left mb-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        disabled={loading}
      >
        {loading ? "Updating..." : selectedMinistry ? selectedMinistry.ministryname : "Select Ministry"}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {ministries.map((ministry) => (
            <div
              key={ministry.ministry_id}
              onClick={() => {
                updateAdminMinistry(ministry);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {ministry.ministryname}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}