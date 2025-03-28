import { NextResponse } from "next/server";
import pool from "@/app/lib/database";
import { showRequestingAdmins } from "@/app/lib/data";

export async function POST(req: Request) {
  const { auth0ID } = await req.json();
  try {
    const client = await pool.getConnection();

    console.log('Auth0ID at API:', auth0ID);
    const ra = await showRequestingAdmins(auth0ID);
    console.log(ra);
    client.release();

    return NextResponse.json(ra);
  } catch (error) {
    console.error("Error fetching unassigned admins:", error);
    return NextResponse.json({ error: "Failed to fetch unassigned admins" }, { status: 500 });
  }
}