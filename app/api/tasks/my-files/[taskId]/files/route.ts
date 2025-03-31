import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const DOCUMENT_PATH = process.env.DOCUMENT_PATH;

export async function POST(
    request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const taskId = parseInt(params.taskId);
        if (!taskId) {
            return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = join(DOCUMENT_PATH!, "documents", taskId.toString());
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = join(uploadDir, fileName);

        // Convert File to Buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        return NextResponse.json({
            name: fileName,
            path: filePath,
            type: file.type,
            size: file.size
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const { fileName } = await request.json();
        const taskId = params.taskId;

        // Use DOCUMENT_PATH for file deletion
        const filePath = join(DOCUMENT_PATH!, "documents", taskId, fileName);

        if (!existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        await unlink(filePath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
} 