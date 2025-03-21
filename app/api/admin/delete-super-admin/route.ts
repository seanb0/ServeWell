import { NextResponse } from 'next/server';
import pool from '@/app/lib/database';

export async function DELETE(request: Request) {
  try {
    const { superadminId, memberId } = await request.json();

    if (!superadminId) {
      return NextResponse.json(
        { message: 'Super-admin ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction
    await pool.query('START TRANSACTION');

    try {
      // Delete from superadmin table
      await pool.query(
        'DELETE FROM superadmin WHERE superadmin_id = ?',
        [superadminId]
      );

      // Optionally, you can also delete the member record
      // Uncomment this if you want to completely remove the user
      /*
      if (memberId) {
        await pool.query(
          'DELETE FROM churchmember WHERE member_id = ?',
          [memberId]
        );
      }
      */

      // Commit the transaction
      await pool.query('COMMIT');

      return NextResponse.json(
        { message: 'Super-admin deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      // Rollback in case of error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting super-admin:', error);
    return NextResponse.json(
      { 
        message: 'Failed to delete super-admin',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 