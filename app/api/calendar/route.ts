import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

// Fetch events based on ministry
export async function GET(req: Request) {
    let connection;
    try {
        const { searchParams } = new URL(req.url);
        const ministry = searchParams.get("ministry");

        if (!ministry) {
            return NextResponse.json({ success: false, error: "Ministry is required" }, { status: 400 });
        }

        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            "SELECT id, title, start, ministry FROM calendar_events WHERE LOWER(ministry) = LOWER(?)",
            [ministry]
        );

        connection.release();

        return NextResponse.json({ success: true, events: rows });

    } catch (error) {
        console.error("❌ Fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Create new event
export async function POST(req: Request) {
    let connection;
    try {
        const { title, start, ministry } = await req.json();

        if (!title || !start || !ministry) {
            return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.execute(
            "INSERT INTO calendar_events (title, start, ministry) VALUES (?, ?, ?)",
            [title, start, ministry]
        );

        connection.release();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Create error:", error);
        return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Delete event
export async function DELETE(req: Request) {
    let connection;
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.execute("DELETE FROM calendar_events WHERE id = ?", [id]);

        connection.release();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Delete error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
