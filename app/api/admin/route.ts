import { NextResponse } from "next/server";
import pool from "@/app/lib/database";
import { showRequestingAdmins } from "@/app/lib/data";

export async function GET(req: Request) {
  const { auth0ID } = await req.json();
  try {
    const client = await pool.getConnection();

    const ra = await showRequestingAdmins(auth0ID);
    console.log(ra);
    client.release();

    return NextResponse.json(ra);
  } catch (error) {
    console.error("Error fetching unassigned admins:", error);
    return NextResponse.json({ error: "Failed to fetch unassigned admins" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { memID, minID } = await req.json();

    if (!memID) {
      return NextResponse.json({ error: "Missing member_id" }, { status: 400 });
    }
    if (!minID) {
      return NextResponse.json({ error: "Missing ministry_id" }, { status: 400 });
    }  

    const client = await pool.getConnection();

    // get the church asssociated with the ministryID we have
    const churchIDQuery = `SELECT church_id FROM ministry WHERE ministry_id = ?;`;
    const values1 = [minID];
    const [result1] = await client.execute(churchIDQuery, values1);
    const church_id = result1[0].church_id;

    const memberUpdate = `UPDATE churchmember SET church_id = ? WHERE member_id = ?;`;
    const values2 = [church_id, memID];
    const [result2] = await client.execute(memberUpdate, values2);

    const usersUpdate = `Update users Set minID = ?, rID=1 WHERE memID = ?;`;
    const values3 = [minID, memID];
    const [result3] = await client.execute(usersUpdate, values3);
    client.release();

    return NextResponse.json({ success: true, affectedRows: result3.affectedRows });
  } catch (error) {
    console.error("Error updating admin ministry:", error);
    return NextResponse.json({ error: "Failed to update ministry" }, { status: 500 });
  }
}