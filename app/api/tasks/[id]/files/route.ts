import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { updateTask, getTaskById } from '@/lib/services/task-service';

const DOCUMENT_PATH = process.env.DOCUMENT_PATH;

// Handle file upload
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const taskId = parseInt(params.id);
        if (isNaN(taskId)) {
            return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
        }

        console.log(`Processing file upload for task ID: ${taskId}`);

        // Get the task
        const task = await getTaskById(taskId);
        if (!task) {
            console.error(`Task not found with ID: ${taskId}`);
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Process the form data with files
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files.length) {
            console.error('No files provided in the request');
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        console.log(`Received ${files.length} files for upload`);

        // Ensure task directory exists
        const uploadDir = join(DOCUMENT_PATH!, taskId.toString());
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
            console.log(`Created directory: ${uploadDir}`);
        }

        // Process each file
        const uploadedFiles = [];
        const existingFiles = task.files ? (task.files as any[]) : [];

        console.log(`Task has ${existingFiles.length} existing files`);

        for (const file of files) {
            try {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = file.name;
                const filePath = join(uploadDir, fileName);

                // Write the file
                await writeFile(filePath, buffer);
                console.log(`File written to: ${filePath}`);

                // Add to uploaded files
                const fileInfo = {
                    name: fileName,
                    path: filePath,
                    type: file.type,
                    size: file.size
                };
                uploadedFiles.push(fileInfo);
                console.log(`Added file info: ${JSON.stringify(fileInfo)}`);
            } catch (error) {
                console.error(`Error saving file ${file.name}:`, error);
            }
        }

        // Update the task with new files
        const updatedFiles = [...existingFiles, ...uploadedFiles];
        console.log(`Updating task with ${updatedFiles.length} total files`);

        // Call updateTask with the full task and updated files array
        const updatedTask = await updateTask(taskId, {
            ...task,
            files: updatedFiles
        });

        if (!updatedTask) {
            console.error(`Failed to update task ${taskId} with new files`);
            return NextResponse.json(
                { error: 'Failed to update task with new files' },
                { status: 500 }
            );
        }

        console.log(`Task ${taskId} updated successfully with new files`);

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
            task: updatedTask
        });
    } catch (error) {
        console.error('Error in file upload API:', error);
        return NextResponse.json(
            { error: 'Failed to upload files', message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Handle file deletion
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const taskId = parseInt(params.id);
        if (isNaN(taskId)) {
            return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
        }

        // Get the body data
        const { fileName } = await request.json();

        if (!fileName) {
            return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
        }

        // Get the task
        const task = await getTaskById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Check if file exists in task
        const existingFiles = task.files ? (task.files as any[]) : [];
        const fileIndex = existingFiles.findIndex(file => file.name === fileName);

        if (fileIndex === -1) {
            return NextResponse.json({ error: 'File not found in task' }, { status: 404 });
        }

        // Delete the file from disk
        const filePath = join(DOCUMENT_PATH!, taskId.toString(), fileName);
        if (existsSync(filePath)) {
            await unlink(filePath);
        }

        // Remove the file from the task's files array
        const updatedFiles = existingFiles.filter(file => file.name !== fileName);
        const updatedTask = await updateTask(taskId, { ...task, files: updatedFiles });

        return NextResponse.json({
            success: true,
            task: updatedTask
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
} 