import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import path from "path";

export async function GET(request: NextRequest) {
    try {
        // Get the path from the query string
        const searchParams = request.nextUrl.searchParams;
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
        const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
        console.log("Normalized path:", normalizedPath);

        // Create the full file path
        const fullPath = join(process.cwd(), normalizedPath);
        console.log("Full file path:", fullPath);

        // Check if the file exists
        if (!existsSync(fullPath)) {
            console.error("File not found:", fullPath);
            return NextResponse.json(
                { error: "File not found", path: fullPath },
                { status: 404 }
            );
        }

        // Read the file content
        const fileBuffer = await readFile(fullPath);
        console.log("File read successfully, size:", fileBuffer.length, "bytes");

        // Get file extension and determine content type
        const ext = path.extname(fullPath).toLowerCase();
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
                contentType = "application/vnd.ms-excel";
                break;
            case ".xlsx":
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                break;
            case ".zip":
                contentType = "application/zip";
                break;
        }

        console.log("Serving file with content type:", contentType);

        // Create response with appropriate headers
        const headers = new Headers({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename=${path.basename(fullPath)}`,
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        return new NextResponse(fileBuffer, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error("Error processing download:", error);
        return NextResponse.json(
            {
                error: "Failed to process download request",
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 