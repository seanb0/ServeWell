import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function POST(req: Request) {
  try {
    const { member_id } = await req.json();
    const client = await pool.getConnection();

    // Change user's rID to 0 (regular user) and minID to NULL
    const updateQuery = `
      UPDATE users 
      SET rID = 0, minID = NULL 
      WHERE memID = ?
    `;
    
    await client.execute(updateQuery, [member_id]);
    
    // Remove from requestingAdmins table
    const deleteQuery = `
      DELETE FROM requestingAdmins 
      WHERE auth0ID = (
        SELECT auth0ID 
        FROM users 
        WHERE memID = ?
      )
    `;
    
    await client.execute(deleteQuery, [member_id]);

    client.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error demoting admin:", error);
    return NextResponse.json({ error: "Failed to demote admin" }, { status: 500 });
  }
} 