'use client';
import { useState, useEffect, useRef } from "react";

interface RejectButtonProps {
    member_id: number; // Pass member_id as a prop
}

export default function RejectButton({ member_id }: RejectButtonProps) {
    async function rejectUser() {
        try {
            const response = await fetch("/api/rejectUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_id: member_id }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.log("Failed user rejection", data.error);
            } 
        } catch (error) {
        console.error("Failed to reject user", error);
        }
    }

    return (
        <button className="bg-red-500 text-white font-bold py-2 px-4 rounded"
            onClick={() => rejectUser()}>
            Reject
        </button>
    );
}