import path from 'path';
import fs from 'fs';
import { writeFile, unlink, rmdir } from 'fs/promises';
import { existsSync } from 'fs';

const DOCUMENT_PATH = process.env.DOCUMENT_PATH;
const DOCUMENTS_DIR = path.join(DOCUMENT_PATH!);
console.log('Using documents directory:', DOCUMENTS_DIR);

// Ensure documents directory exists
if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

export async function uploadFile(taskId: number, file: File) {
    try {
        const taskDir = path.join(DOCUMENTS_DIR, taskId.toString());

        // Ensure task directory exists
        if (!fs.existsSync(taskDir)) {
            fs.mkdirSync(taskDir, { recursive: true });
        }

        const filePath = path.join(taskDir, file.name);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(filePath, buffer);

        return {
            name: file.name,
            path: filePath,
            type: file.type,
            size: file.size
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export async function deleteFile(taskId: number, fileName: string) {
    try {
        const filePath = path.join(DOCUMENTS_DIR, taskId.toString(), fileName);

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

export async function getTaskFiles(taskId: number) {
    try {
        const taskDir = path.join(DOCUMENTS_DIR, taskId.toString());

        if (!fs.existsSync(taskDir)) {
            return [];
        }

        const files = await fs.promises.readdir(taskDir);
        return files.map(fileName => ({
            name: fileName,
            path: path.join(taskDir, fileName),
        }));
    } catch (error) {
        console.error('Error getting task files:', error);
        throw error;
    }
}

export async function saveTaskFiles(taskId: number, files: File[]) {
    const taskDir = path.join(DOCUMENTS_DIR, taskId.toString());

    // Create task directory if it doesn't exist
    if (!fs.existsSync(taskDir)) {
        fs.mkdirSync(taskDir, { recursive: true });
    }

    const savedFiles = [];

    for (const file of files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const filePath = path.join(taskDir, file.name);
            await writeFile(filePath, buffer);

            savedFiles.push({
                name: file.name,
                path: filePath,
                type: file.type,
                size: file.size
            });
        } catch (error) {
            console.error(`Error saving file ${file.name}:`, error);
        }
    }

    return savedFiles;
}

export async function deleteTaskFile(taskId: number, fileName: string): Promise<void> {
    const filePath = path.join(DOCUMENTS_DIR, taskId.toString(), fileName);

    if (existsSync(filePath)) {
        await unlink(filePath);
    }
}

export async function deleteTaskDirectory(taskId: number): Promise<void> {
    const dirPath = path.join(DOCUMENTS_DIR, taskId.toString());

    if (existsSync(dirPath)) {
        await rmdir(dirPath);
    }
} 