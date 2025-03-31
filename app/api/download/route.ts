import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import path from "path";

const DOCUMENT_PATH = process.env.DOCUMENT_PATH;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get("path");

        console.log("Download request received for path:", filePath);

        // Validate the path parameter
        if (!filePath) {
            console.error("No path provided");
            return NextResponse.json(
                { error: "No file path provided" },
                { status: 400 }
            );
        }

        // Normalize the path to prevent directory traversal attacks
        const normalizedPath = filePath.replace(/^\/+/, "");
        console.log("Normalized path:", normalizedPath);

        // Construct the full file path using DOCUMENT_PATH
        const fullFilePath = join(DOCUMENT_PATH!, normalizedPath);
        console.log("Full file path:", fullFilePath);

        // Check if the file exists
        if (!existsSync(fullFilePath)) {
            console.error("File not found:", fullFilePath);
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        // Read the file content
        const fileBuffer = await readFile(fullFilePath);
        const fileName = normalizedPath.split("/").pop() || "file";

        // Get file extension and determine content type
        const ext = fileName.split(".").pop()?.toLowerCase();
        let contentType = "application/octet-stream"; // Default content type

        // Map common file extensions to content types
        const contentTypes: { [key: string]: string } = {
            "pdf": "application/pdf",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xls": "application/vnd.ms-excel",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "txt": "text/plain",
            "csv": "text/csv",
            "zip": "application/zip",
            "rar": "application/x-rar-compressed",
        };

        if (ext && contentTypes[ext]) {
            contentType = contentTypes[ext];
        }

        console.log("Serving file with content type:", contentType);

        // Create response with appropriate headers
        const response = new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
                "Content-Length": fileBuffer.length.toString(),
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            },
        });

        return response;

    } catch (error) {
        console.error("Error downloading file:", error);
        return NextResponse.json(
            { error: "Failed to download file" },
            { status: 500 }
        );
    }
} 