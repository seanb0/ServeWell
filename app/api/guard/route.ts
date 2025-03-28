import pool from '@/app/lib/database';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const {authid} = await req.json();
        console.log('Auth ID:', authid);
        const client = await pool.getConnection();
        const query = `select rID from users where auth0ID = ?;`;
        const [result] = await client.execute(query, [authid]);
        client.release();

        const data = result[0];
        console.log('Data:', data);
        return NextResponse.json(result);
    } catch (error){
        console.error('Error fetching roles:', error);
        return NextResponse.json(
            { 
            error: 'Failed to fetch roles',
            details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }    
}