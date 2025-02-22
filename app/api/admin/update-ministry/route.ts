import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET() {
  try {
    const client = await pool.getConnection();

    const query = `select m.* from churchmember m JOIN Admin a ON a.Admin_ID = m.member_id;`;
    const [result] = await client.execute(query);
    client.release();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching unassigned admins:", error);
    return NextResponse.json({ error: "Failed to fetch unassigned admins" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { admin_id, ministry_id } = await req.json();

    if (!admin_id || !ministry_id) {
      return NextResponse.json({ error: "Missing admin_id or ministry_id" }, { status: 400 });
    }

    const client = await pool.getConnection();

    const query = `UPDATE admin SET ministry_id = $1 WHERE member_id = $2 RETURNING *`;
    const values = [ministry_id, admin_id];
    const [result] = await client.execute(query, values);
    client.release();

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error("Error updating admin ministry:", error);
    return NextResponse.json({ error: "Failed to update ministry" }, { status: 500 });
  }
}
