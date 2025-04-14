import pool from '@/app/lib/database';
import { NextResponse } from 'next/server';

export async function POST( req: Request ){
    try {
        const { authid } = await req.json();
        const client = await pool.getConnection();
        const query = `SELECT minID FROM users WHERE auth0ID = ?;`;
        const [result] = await client.execute(query, [authid]);
        client.release();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching user MinID:', error);
        return NextResponse.json(
            { 
            error: 'Failed to fetch user MinID',
            details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}