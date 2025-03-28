"use server";
import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

////////////////////////////////////////
/////// User-related functions ///////
////////////////////////////////////////

export async function getUserChurch(auth0ID: string) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute(
            `SELECT church_id FROM churchmember WHERE member_id = (SELECT memID FROM users WHERE auth0ID = ?)`,
            [auth0ID]
        );
        connection.release();
        return data;
    } catch (error) {
        console.error("Failed to fetch user church:", error);
        throw new Error("Failed to fetch user church.");
    } finally {
        if (connection) connection.release();
    }
    
}

export async function getRequestingAdmins(auth0ID: string) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [data] = await connection.execute(``);
        connection.release();
        return data;
    } catch (error) {
        console.error("Failed to fetch requesting admins:", error);
        throw new Error("Failed to fetch requesting admins.");
    } finally {
        if (connection) connection.release();
    }
}    

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

export async function showRequestingAdmins(auth0ID: string) {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = `SELECT cm.fname, cm.email, cm.member_id, u.minID, cm.church_id FROM churchmember cm INNER JOIN users u ON cm.member_id = u.memID INNER JOIN requestingAdmins ra ON u.auth0ID = ra.auth0ID WHERE ra.churchID = (SELECT church_id FROM churchmember WHERE member_id = (SELECT memID FROM users WHERE auth0ID = ?));`
        const values = [auth0ID];
        const [data] = await connection.execute(query, values);
        connection.release();
        return data;
    } catch (error) {
        console.error("Failed to fetch requesting admins:", error);
        throw new Error("Failed to fetch requesting admins.");
    } finally {
        if (connection) connection.release();
    }
}

// when a user logs in for the first time, give them "BaseUser" privileges
export async function insertUser(nickname: string, Auth0_ID: string, email: string) {
    try {
        const client = await pool.getConnection();

        const existingUserCheck = 'Select * from users where auth0ID = ?';
        const [result] = await client.execute(existingUserCheck, [Auth0_ID]);
        console.log("Result:", result.length);
        if (result.length > 0) {
            client.release();
            return NextResponse.json({ success: false, error: "Admin already exists" }, { status: 400 });
        } else {
            const insertMember = `insert into churchmember (fname, email) values (?, ?);`;
            const values = [nickname, email];
            const [newMember] = await client.execute(insertMember, values);
            const memID = newMember.insertId;

            const insertUser = `insert into users (auth0ID, memID) values (?, ?);`;
            const values1 = [Auth0_ID, memID];
            const [newUser] = await client.execute(insertUser, values1);
            client.release();

            return NextResponse.json({ success: true, affectedRows: newUser.affectedRows });
        }
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
            `SELECT rID FROM users WHERE auth0ID = ?`,
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
    auth0ID: string;
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
            `INSERT INTO churchmember (fname, mname, lname, email, memberphone, church_id, activity_status) 
             VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
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

        const [adminResult] = await connection.execute(
            `INSERT IGNORE INTO users (memID, auth0ID, rID) VALUES (?, ?, 2);`, [member_id, data.auth0ID]
        );


        await connection.commit(); // Commit the transaction
        connection.release();

        return {
            success: true,
            member_id: member_id,
            admin_id: adminResult.insertId
        };
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback in case of error
        console.error("Failed to create super admin:", error);
        throw new Error("Failed to create super admin.");
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

