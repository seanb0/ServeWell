"use server";
import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

////////////////////////////////////////
/////// Admin-related functions ///////
////////////////////////////////////////

export async function getUnAssignedAdmins() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute(
            `SELECT * FROM admin WHERE ministry_id IS NULL`
        );
        connection.release();
        return data;
    } catch (error) {
        console.error("Failed to fetch unassigned admins:", error);
        throw new Error("Failed to fetch unassigned admins.");
    } finally {
        if (connection) connection.release();
    }
}

export async function insertAdmins(nickname: string, Auth0_ID: string) {
    try {
      const client = await pool.getConnection();

      const query = 'Select * from Admin where Auth0_ID = ?';
      const [result] = await client.execute(query, [Auth0_ID]);
        if (result.length > 0) {
            client.release();
            return NextResponse.json({ success: false, error: "Admin already exists" }, { status: 400 });
        }
  
      const query1 = `insert into Admin (AdminName, Ministry_ID, Auth0_ID, Role_ID) values (?, null, ?, 1);`;
      const values = [nickname, Auth0_ID];
      const [result1] = await client.execute(query1, values);
      client.release();
  
      return NextResponse.json({ success: true, affectedRows: result1.affectedRows });
    } catch(error) {
      console.error("Error inserting admin:", error);
      return NextResponse.json({ error: "Failed to insert admin" }, { status: 500 });
    }
  }

  // for middleware to check if user is an admin
export async function verifyAdmin(Auth0_ID: string) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute(
            `SELECT Role_ID FROM Admin WHERE Auth0_ID = ?`,
            [Auth0_ID]
        );
        console.log("Data:", data);
        connection.release();
        return data;
    } catch (error) {
        console.error("Failed to fetch admin:", error);
        throw new Error("Failed to fetch admin.");
    } finally {
        if (connection) connection.release();
    }
}


////////////////////////////////////////
/////// Church-related functions ///////
////////////////////////////////////////


// Fetch all churches
export async function getChurches() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute("SELECT * FROM church");
        connection.release();
        return data;
    } catch (err) {
        console.error("Database Error", err);
        throw new Error("Failed to fetch church data");
    } finally {
        if (connection) connection.release();
    }
}

// Create a new church
export async function createChurch(churchData: {
    churchName: string;
    denomination: string;
    email: string;
    phone: string;
    address: string;
    postalcode: string;
    city: string;
}) {
    let connection;
    console.log("Values being inserted:", [
        churchData.churchName ?? null,
        churchData.denomination ?? null,
        churchData.email ?? null,
        churchData.phone ?? null,
        churchData.address ?? null,
        churchData.postalcode ?? null,
        churchData.city ?? null,
    ]);

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO church (churchname, denomination, email, churchphone, streetaddress, postalcode, city)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                churchData.churchName,
                churchData.denomination ?? null,
                churchData.email ?? null,
                churchData.phone ?? null,
                churchData.address ?? null,
                churchData.postalcode ?? null,
                churchData.city ?? null,
            ]
        );

        connection.release();
        return { success: true, insertedId: result.insertId };
    } catch (error) {
        console.error("Failed to create church:", error);
        throw new Error("Failed to create church.");
    } finally {
        if (connection) connection.release();
    }
}

// Function to update a church
export async function updateChurch(churchData: {
    churchName: string;
    denomination: string;
    email: string;
    phone: string;
    address: string;
    postalcode: string;
    city: string;
  }) {
    let connection;
    try {
      connection = await pool.getConnection();
  
      // Check if the church exists
      const [existingChurch] = await connection.execute(
        `SELECT church_id FROM church WHERE churchname = ?`,
        [churchData.churchName]
      );
  
      if (existingChurch.length > 0) {
        // Update the existing church
        await connection.execute(
          `UPDATE church 
           SET denomination = ?, email = ?, churchphone = ?, streetaddress = ?, postalcode = ?, city = ? 
           WHERE churchname = ?`,
          [
            churchData.denomination,
            churchData.email,
            churchData.phone,
            churchData.address,
            churchData.postalcode,
            churchData.city,
            churchData.churchName,
          ]
        );
        return { success: true, message: 'Church updated successfully' };
      } else {
        // Church does not exist
        return { success: false, message: 'Church not found' };
      }
    } catch (error) {
      console.error('Failed to update church:', error);
      throw new Error('Failed to update church.');
    } finally {
      if (connection) connection.release();
    }
  }

////////////////////////////////////////
////// Ministry-related functions //////
////////////////////////////////////////

// Function to fetch all ministries
export async function getMinistries() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute("SELECT ministry_id, ministryname, url_path FROM ministry");
        connection.release();

        console.log("Fetched ministries:", data);
        return data;
    } catch (err) {
        console.error("Database Error:", err);
        throw new Error("Failed to fetch ministry data");
    } finally {
        if (connection) connection.release();
    }
}

// Fetch ministry by URL path
export async function getMinistryByUrlPath(urlPath: string) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [ministry] = await connection.execute(
            "SELECT * FROM ministry WHERE url_path = ? LIMIT 1",
            [urlPath]
        );
        connection.release();
        return ministry[0] || null;
    } catch (error) {
        console.error("Failed to fetch ministry:", error);
        throw new Error("Failed to fetch ministry.");
    } finally {
        if (connection) connection.release();
    }
}

// Fetch ministry by name (case-insensitive search)
export async function getMinistryByName(name: string) {
    let connection;
    try {
        console.log("Fetching ministry with name:", name);
        connection = await pool.getConnection();
        const [ministry] = await connection.execute(
            "SELECT * FROM ministry WHERE LOWER(url_path) LIKE LOWER(?) LIMIT 1",
            [`%${name}%`]
        );
        connection.release();

        console.log("Found ministry:", ministry[0]);
        if (!ministry[0]) {
            console.log("No ministry found with name:", name);
        }

        return ministry[0] || null;
    } catch (error) {
        console.error("Error in getMinistryByName:", error);
        throw new Error("Failed to fetch ministry.");
    } finally {
        if (connection) connection.release();
    }
}


// Function to create a ministry
export async function createMinistry(ministryData: {
    MinistryName: string;
    Description: string;
    Church_ID: number;
    Budget: number;
}) {
    let connection;
    try {
        connection = await pool.getConnection();

        const urlFriendlyName = ministryData.MinistryName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        const [result] = await connection.execute(
            `INSERT INTO ministry (ministryname, church_id, description, url_path, budget) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                ministryData.MinistryName,
                ministryData.Church_ID,
                ministryData.Description,
                urlFriendlyName,
                ministryData.Budget
            ]
        );

        connection.release();
        return { success: true, insertedId: result.insertId };
    } catch (error) {
        console.error("Failed to create ministry:", error);
        throw new Error("Failed to create ministry.");
    } finally {
        if (connection) connection.release();
    }
}

// Function to update a ministry
export async function updateMinistry(ministryData: {
    ministryName: string;
    budget: number;
    description: string;
  }) {
    let connection;
    try {
      connection = await pool.getConnection();
  
      // Check if the ministry exists
      const [existingMinistry] = await connection.execute(
        `SELECT ministry_id FROM ministry WHERE ministryname = ?`,
        [ministryData.ministryName]
      );
  
      if (existingMinistry.length > 0) {
        // Update the existing ministry
        await connection.execute(
          `UPDATE ministry SET budget = ?, description = ? WHERE ministryname = ?`,
          [ministryData.budget, ministryData.description, ministryData.ministryName]
        );
        return { success: true, message: 'Ministry updated successfully' };
      } else {
        // Ministry does not exist
        return { success: false, message: 'Ministry not found' };
      }
    } catch (error) {
      console.error('Failed to update ministry:', error);
      throw new Error('Failed to update ministry.');
    } finally {
      if (connection) connection.release();
    }
  }

  // Function to delete a ministry by url_path variable
  export async function deleteMinistryByURLPath(name: string) {
    let connection;
    try {
        connection = await pool.getConnection();

        // Start a transaction
        await connection.beginTransaction();

        // Set Ministry_ID to NULL in the Admin table for related records
        await connection.execute(
            `UPDATE Admin SET ministry_id = NULL WHERE Ministry_ID = (SELECT ministry_id FROM ministry WHERE url_path = ?)`,
            [name]
        );

        // Delete the ministry
        const [result] = await connection.execute(
            `DELETE FROM ministry WHERE url_path = ?`,
            [name]
        );

        // Commit the transaction
        await connection.commit();

        connection.release();
        return result.affectedRows > 0; // Returns true if a row was deleted
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback in case of error
        console.error("Failed to delete ministry:", error);
        throw new Error("Failed to delete ministry.");
    } finally {
        if (connection) connection.release();
    }
}

////////////////////////////////////////
///// SuperAdmin-related functions /////
////////////////////////////////////////

// Function to create a super admin
export async function createSuperAdmin(data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    username: string;
    password: string;
    church_id: number;
}) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Start a transaction

        const [churchId] = await connection.execute(
            "SELECT church_id FROM church ORDER BY church_id DESC LIMIT 1;"
        );

        // Insert into churchmember table
        const [memberResult] = await connection.execute(
            `INSERT INTO churchmember (fname, mname, lname, email, memberphone, church_id, church_join_date, activity_status) 
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Active')`,
            [
                data.firstName,
                data.middleName || null,
                data.lastName,
                data.email,
                data.phoneNumber,
                data.church_id
            ]
        );

        const member_id = memberResult.insertId;

        // Insert into superadmin table
        const [superAdminResult] = await connection.execute(
            `INSERT INTO superadmin (member_id, church_id) 
             VALUES (?, ?)`,
            [member_id, data.church_id]
        );

        await connection.commit(); // Commit the transaction
        connection.release();

        return {
            success: true,
            member_id: member_id,
            superadmin_id: superAdminResult.insertId
        };
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback in case of error
        console.error("Failed to create super admin:", error);
        throw new Error("Failed to create super admin.");
    } finally {
        if (connection) connection.release();
    }
}

// Function to fetch super admins
export async function getSuperAdmins() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute("SELECT * FROM superadmin");
        connection.release();
        return data;
    } catch (err) {
        console.error("Database Error:", err);
        throw new Error("Failed to fetch super admin data");
    } finally {
        if (connection) connection.release();
    }
}

////////////////////////////////////////
//////// Role-related functions ////////
////////////////////////////////////////

export async function getMedia() {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM media 
            ORDER BY date DESC
        `);
        return rows;
    } catch (error) {
        console.error('Error fetching media:', error);
        throw new Error('Failed to fetch media.');
    }
}