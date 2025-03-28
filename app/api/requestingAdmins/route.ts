import { NextResponse } from 'next/server';
import pool from '@/app/lib/database'; 
import { getRequestingAdmins } from '@/app/lib/data';


export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log('ChurchID & Auth0ID:', data.churchID, data.auth0ID);
        const client = await pool.getConnection();
        const query = `INSERT INTO requestingAdmins (churchID, auth0ID) VALUES (?, ?)`;
        const [result] = await client.query(query, [data.churchID, data.auth0ID]);
        client.release();

        return NextResponse.json({
            success: true,
            message: 'Requesting admin created successfully',
            requestingAdminId: result.insertId,
        });
    }
    catch (error) {
        console.error('Detailed error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create requesting admin',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const data = await req.json();
        console.log('Auth0ID:', data.auth0ID);
        const client = await pool.getConnection();
        const requestingAdmins = await getRequestingAdmins(data.auth0ID);

        return NextResponse.json({requestingAdmins});
    }
    catch (error) {
        console.error('Detailed error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch requesting admins',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}