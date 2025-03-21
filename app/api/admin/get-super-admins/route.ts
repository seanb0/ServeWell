import { NextResponse } from 'next/server';
import pool from '@/app/lib/database';

export async function GET() {
  try {
    // Add some debugging logs
    console.log('Fetching super-admins...');
    
    // Query to get all super-admins with their member details
    const [superAdmins] = await pool.query(`
      SELECT 
        s.superadmin_id, 
        s.member_id, 
        s.church_id,
        c.fname, 
        c.lname, 
        c.email, 
        c.memberphone, 
        c.activity_status
      FROM 
        superadmin s
      JOIN 
        churchmember c ON s.member_id = c.member_id
      ORDER BY 
        s.superadmin_id
    `);
    
    console.log('Super-admins fetched:', superAdmins);
    
    return NextResponse.json(superAdmins, { status: 200 });
  } catch (error) {
    console.error('Error fetching super-admins:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch super-admins',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 