import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

// Fetch the latest uploaded file based on ministry and page type
// Fetch all uploaded files based on ministry and page type
export async function GET(req: Request) {
    let connection;
    try {
        const { searchParams } = new URL(req.url);
        const ministry = searchParams.get("ministry");
        const pageType = searchParams.get("page_type");

        if (!ministry || !pageType) {
            return NextResponse.json({ success: false, error: "Ministry and page type are required" }, { status: 400 });
        }

        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            "SELECT file_name, file_data, tab_name FROM uploaded_files WHERE LOWER(ministry) = LOWER(?) AND LOWER(page_type) = LOWER(?) ORDER BY created_at DESC",
            [ministry, pageType]
        );

        connection.release();

        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: false, message: "No files found" });
        }

        // Convert all files into base64 format
        const files = rows.map((fileRow: any) => ({
            filename: fileRow.file_name,
            fileData: Buffer.from(fileRow.file_data).toString("base64"),
            tabName: fileRow.tab_name,
        }));

        return NextResponse.json({ success: true, files });

    } catch (error) {
        console.error("❌ Fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch files" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Upload a new file
export async function POST(req: Request) {
    let connection;
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const tabName = formData.get("tab_name") as string;
        const ministry = formData.get("ministry") as string;
        const pageType = formData.get("page_type") as string;

        if (!file || !tabName || !ministry || !pageType) {
            return NextResponse.json({ success: false, error: "File, tab name, ministry, and page type are required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "INSERT INTO uploaded_files (file_name, file_data, tab_name, ministry, page_type) VALUES (?, ?, ?, ?, ?)",
            [file.name, buffer, tabName, ministry, pageType]
        );

        connection.release();

        return NextResponse.json({ success: true, id: result.insertId });

    } catch (error) {
        console.error("❌ Upload error:", error);
        return NextResponse.json({ success: false, error: "File upload failed" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Delete file by tab name
export async function DELETE(req: Request) {
    let connection;
    try {
        const { tab_name, ministry, page_type } = await req.json();

        if (!tab_name || !ministry || !page_type) {
            return NextResponse.json({ success: false, error: "Tab name, ministry, and page type are required" }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.execute(
            "DELETE FROM uploaded_files WHERE LOWER(tab_name) = LOWER(?) AND LOWER(ministry) = LOWER(?) AND LOWER(page_type) = LOWER(?)",
            [tab_name, ministry, page_type]
        );

        connection.release();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Delete error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete file" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
