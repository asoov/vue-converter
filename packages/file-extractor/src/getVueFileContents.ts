import * as fs from 'fs';
import * as path from 'path';
import { handleError } from 'utils';

/**
 * Reads files of a specific type from a directory and returns an object containing
 * the original file name and its stringified content.
 * @param dirPath - The path to the directory.
 * @param fileType - The desired file extension (e.g., '.txt').
 * @returns An array of objects, each containing a filename and its content.
 */
export function getVueFileContents(dirPath: string, fileType: string): Array<{ filename: string; content: string }> {
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory "${dirPath}" does not exist.`);
  }

  const files = fs.readdirSync(dirPath);
  const matchedFiles = files.filter(file => path.extname(file) === fileType);

  if (matchedFiles.length === 0) {
    throw new Error(`No files of type "${fileType}" found in the directory "${dirPath}".`);
  }

  const result: Array<{ filename: string; content: string }> = [];

  matchedFiles.forEach(file => {
    const filePath = path.join(dirPath, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      result.push({ filename: file, content: content });
    } catch (error) {
      handleError(new Error(`Error reading file "${file}": ${(error as Error).message}`), { throw: true })
    }
  });

  return result;
}
