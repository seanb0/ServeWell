import { NextResponse } from "next/server";
import { getUserChurch } from "@/app/lib/data";


export async function POST(req) {
    try {
        const { auth0_id } = await req.json();
        const result = await getUserChurch(auth0_id);
        return NextResponse.json(result);
    } catch (error) {
      console.error("Error fetching user churches:", error);
      return NextResponse.json({ error: "Failed to fetch unassigned admins" }, { status: 500 });
    }
  }
  