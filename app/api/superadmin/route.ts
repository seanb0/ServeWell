import { NextResponse } from 'next/server';
import { createSuperAdmin } from '../../lib/data';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('Received SuperAdmin registration data:', data);

        const result = await createSuperAdmin({
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            username: data.username,
            password: data.password,
            church_id: data.church_id,
            auth0ID: data.auth0ID
        });

        console.log('SuperAdmin creation result:', result);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Detailed Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to register SuperAdmin', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
} 