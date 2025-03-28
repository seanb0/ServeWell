import { NextResponse } from "next/server";
import pool from "@/app/lib/database";


export async function POST(req: Request) {
    const { authid } = await req.json();
    try {
        console.log('AuthID in API:', authid);
        const client = await pool.getConnection();
    
        const query = `SELECT * FROM users WHERE auth0ID = ?`;
        const [result] = await client.query(query, [authid]);
        console.log('Result:', result);
        client.release();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching unassigned admins:", error);
        return NextResponse.json({ error: "Failed to fetch unassigned admins" }, { status: 500 });
    }
}