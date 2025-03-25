import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { unlink, rmdir } from 'fs/promises';
import { existsSync } from 'fs';

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');
console.log(DOCUMENTS_DIR)

// Ensure documents directory exists
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR);
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
        type: file.type
      });
    } catch (error) {
      console.error(`Error saving file ${file.name}:`, error);
    }
  }

  return savedFiles;
}

export async function deleteTaskFile(taskId: number, fileName: string): Promise<void> {
    const filePath = join(process.cwd(), "documents", taskId.toString(), fileName);
    
    if (existsSync(filePath)) {
        await unlink(filePath);
    }
}

export async function getTaskFiles(taskId: number) {
  const taskDir = path.join(DOCUMENTS_DIR, taskId.toString());
  
  if (!fs.existsSync(taskDir)) {
    return [];
  }

  const files = fs.readdirSync(taskDir);
  return files.map(file => ({
    name: file,
    path: path.join(taskDir, file),
    type: path.extname(file).slice(1)
  }));
}

export async function deleteTaskDirectory(taskId: number): Promise<void> {
    const dirPath = join(process.cwd(), "documents", taskId.toString());
    
    if (existsSync(dirPath)) {
        await rmdir(dirPath);
    }
} 