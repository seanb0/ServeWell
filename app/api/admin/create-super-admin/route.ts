import { NextResponse } from 'next/server';
import pool from '@/app/lib/database';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Start a transaction
    await pool.query('START TRANSACTION');

    try {
      // Check if email already exists
      const [existingUsers] = await pool.query(
        'SELECT * FROM churchmember WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        await pool.query('ROLLBACK');
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }

      // Get the first church_id (for demo purposes)
      const [churches] = await pool.query('SELECT church_id FROM church LIMIT 1');
      if (!churches.length) {
        await pool.query('ROLLBACK');
        return NextResponse.json(
          { message: 'No church found in the database' },
          { status: 400 }
        );
      }
      const church_id = churches[0].church_id;

      // Insert the new member into the churchmember table
      const [memberResult] = await pool.query(
        'INSERT INTO churchmember (fname, lname, email, memberphone, activity_status, church_id) VALUES (?, ?, ?, ?, ?, ?)',
        [firstName, lastName, email, phone, 'Active', church_id]
      );

      const member_id = memberResult.insertId;

      // Insert into superadmin table
      await pool.query(
        'INSERT INTO superadmin (member_id, church_id) VALUES (?, ?)',
        [member_id, church_id]
      );

      // Commit the transaction
      await pool.query('COMMIT');

      // Return success response
      return NextResponse.json(
        { 
          message: 'Super-admin created successfully',
          member_id: member_id
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback in case of error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating super-admin:', error);
    return NextResponse.json(
      { 
        message: 'Failed to create super-admin',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 