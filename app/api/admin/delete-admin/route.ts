import { NextResponse } from 'next/server';
import pool from '@/app/lib/database';

interface RequestBody {
  memberId: string | number;
}

export async function DELETE(request: Request) {
  try {
    // Get the member ID from the request body
    const { memberId }: RequestBody = await request.json();
    
    if (!memberId) {
      return NextResponse.json(
        { message: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete admin with member ID: ${memberId}`);
    
    // First, check if the admin exists and get the Admin_ID
    const [adminResults] = await pool.query(
      `SELECT * FROM member_and_admin WHERE member_id = ?`,
      [memberId]
    );
    
    if (!adminResults || adminResults.length === 0) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Log the admin record for debugging
    console.log('Admin record found:', adminResults[0]);
    
    const adminRecord = adminResults[0];
    const adminId = adminRecord.Admin_ID;
    
    console.log(`Admin_ID to delete: ${adminId}`);
    
    // First, delete from superadmin if they are a superadmin
    console.log('Attempting to delete from superadmin table...');
    const [superadminResult] = await pool.query(
      `DELETE FROM superadmin WHERE member_id = ?`,
      [memberId]
    );
    console.log('Superadmin delete result:', superadminResult);
    
    // Then delete from the Admin table
    console.log('Attempting to delete from Admin table...');
    const [adminDeleteResult] = await pool.query(
      `DELETE FROM Admin WHERE Admin_ID = ?`,
      [adminId]
    );
    console.log('Admin delete result:', adminDeleteResult);
    
    if (adminDeleteResult.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Admin record not deleted. Please check server logs.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Admin deleted successfully',
      details: {
        memberId,
        adminId,
        superadminResult,
        adminDeleteResult
      }
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { message: 'Failed to delete admin', error: error.message },
      { status: 500 }
    );
  }
} 