import {insertUser, verifyAdmin} from '@/app/lib/data';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const {nickname, auth0_id, email} = await req.json();
        // console.log('User:', nickname, auth0_id, email);
        const result = await insertUser(nickname, auth0_id, email);
        return NextResponse.json({ success: true });
    } catch(error) {
        console.error('Detailed error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const {auth0_id} = await req.json();
        const admins = await verifyAdmin(auth0_id);
        return NextResponse.json(admins);
    } catch(error) {
        console.error('Detailed error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}