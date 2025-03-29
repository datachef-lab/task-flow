import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // Join the path segments and normalize
        if (!params.path || !Array.isArray(params.path)) {
            console.error("Invalid path params:", params);
            return NextResponse.json(
                { error: "Invalid path parameters" },
                { status: 400 }
            );
        }
        
        const pathSegments = params.path;
        console.log("Requested file path segments:", pathSegments);
        
        const fullPath = pathSegments.join("/");
        console.log("Joined path:", fullPath);

        // Full path on server
        const filePath = join(process.cwd(), "documents", fullPath);
        console.log("Absolute file path:", filePath);

        // Check if file exists
        if (!existsSync(filePath)) {
            console.error("File not found:", filePath);
            return NextResponse.json(
                { error: "File not found", path: filePath },
                { status: 404 }
            );
        }

        console.log("File exists, reading content...");

        // Read file
        const fileBuffer = await readFile(filePath);
        console.log("File read successfully, size:", fileBuffer.length, "bytes");

        // Get file extension to determine content type
        const ext = path.extname(filePath).toLowerCase();
        let contentType = "application/octet-stream"; // Default content type

        // Set appropriate content type based on extension
        switch (ext) {
            case ".pdf":
                contentType = "application/pdf";
                break;
            case ".jpg":
            case ".jpeg":
                contentType = "image/jpeg";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
            case ".txt":
                contentType = "text/plain";
                break;
            case ".doc":
            case ".docx":
                contentType = "application/msword";
                break;
            case ".xls":
            case ".xlsx":
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                break;
            case ".zip":
                contentType = "application/zip";
                break;
        }

        console.log("Serving file with content type:", contentType);

        // Create response headers
        const headers = new Headers({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename=${path.basename(filePath)}`,
            "Content-Length": fileBuffer.length.toString(),
            // Add cache control headers
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        // Set headers and return file
        const response = new NextResponse(fileBuffer, {
            status: 200,
            headers: headers
        });

        return response;
    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json(
            { error: "Failed to serve file", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 