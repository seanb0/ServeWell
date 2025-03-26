"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import "@/app/globals.css";

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ id: "", title: "", start: "", end: "" });
    const [isEditing, setIsEditing] = useState(false);
    const params = useParams();
    const ministry = params.name || "default";

    useEffect(() => {
        async function fetchEvents() {
            const res = await fetch(`/api/calendar?ministry=${ministry}`);
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        }
        fetchEvents();
    }, [ministry]);

    const handleDateSelect = (selectionInfo) => {
        setNewEvent({ id: "", title: "", start: selectionInfo.startStr, end: selectionInfo.endStr || selectionInfo.startStr });
        setIsEditing(false);
        setOpen(true);
    };

    const handleEventClick = (info) => {
        setNewEvent({ id: info.event.id, title: info.event.title, start: info.event.startStr, end: info.event.endStr || info.event.startStr });
        setIsEditing(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setNewEvent({ id: "", title: "", start: "", end: "" });
        setIsEditing(false);
    };
    
    const saveEvent = async () => {
        if (!newEvent.title || !newEvent.start) {
            console.error("Missing required fields:", newEvent);
            return;
        }
    
        const method = isEditing ? "PUT" : "POST";
        const res = await fetch("/api/calendar", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newEvent, ministry }),
        });
    
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Failed to save event:", errorText);
            return;
        }
    
        try {
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Error parsing response JSON:", error);
        }
    
        handleClose();
    };
    

    const deleteEvent = async () => {
        if (!newEvent.id) return;
    
        const res = await fetch("/api/calendar", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newEvent.id }),
        });
    
        const data = await res.json();
        if (data.success) {
            window.location.reload(); // Refresh the page to update the calendar
        }
    };
    
    return (
        <section className="calendar-page h-screen overflow-y-auto">
            <div className="bg-white p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800">ServeWell</h1>
            </div>
            <div className="flex-1 flex flex-col bg-blue-500 justify-center items-center p-10">
                <div className="calendar-container flex justify-center items-center mt-6 w-full max-w-4xl">
                    <div className="w-full">
                        <h1 className="text-xl font-semibold text-gray-700 mb-4">Event Calendar</h1>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                            initialView="dayGridMonth"
                            selectable={true}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            events={events}
                            height="auto"
                        />
                    </div>
                </div>
            </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? "Edit Event" : "Add Event"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Event Title"
                        fullWidth
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    {isEditing && (
                        <Button onClick={deleteEvent} color="secondary">
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={saveEvent} color="primary">
                        {isEditing ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
}
