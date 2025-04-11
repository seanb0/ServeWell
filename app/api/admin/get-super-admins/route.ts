import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function POST(req: Request) {
  try {
    const { auth0ID } = await req.json();
    const client = await pool.getConnection();

    // Get all super admins (rID = 2) from the same church as the requesting user
    const query = `
      SELECT cm.fname, cm.email, cm.member_id
      FROM churchmember cm
      INNER JOIN users u ON cm.member_id = u.memID
      WHERE u.rID = 2
      AND cm.church_id = (
        SELECT church_id 
        FROM churchmember 
        WHERE member_id = (
          SELECT memID 
          FROM users 
          WHERE auth0ID = ?
        )
      )
    `;
    
    const [superAdmins] = await client.execute(query, [auth0ID]);
    
    client.release();
    return NextResponse.json(superAdmins);
  } catch (error) {
    console.error("Error fetching super admins:", error);
    return NextResponse.json({ error: "Failed to fetch super admins" }, { status: 500 });
  }
} 