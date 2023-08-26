import * as fs from 'fs';
import * as path from 'path';
import { VueFile, handleError } from 'utils';

/**
 * Filters the files in a directory by the provided file type.
 * @param dirPath - The path to the directory.
 * @param fileType - The desired file extension (e.g., '.txt').
 * @returns An array of filenames that match the provided fileType.
 */
function filterFilesByType(dirPath: string, fileType: string): string[] {
  const files = fs.readdirSync(dirPath);
  return files.filter(file => path.extname(file) === fileType);
}

/**
 * Reads the content of a file.
 * @param filePath - The path to the file.
 * @returns The content of the file as a string.
 */
function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Processes the matched files and returns their content.
 * @param matchedFiles - The array of matched filenames.
 * @param dirPath - The path to the directory.
 * @returns An array of objects, each containing a filename and its content.
 */
function processMatchedFiles(matchedFiles: string[], dirPath: string): Array<VueFile> {
  return matchedFiles.map(file => {
    const filePath = path.join(dirPath, file);
    try {
      const content = readFileContent(filePath);
      return { fileName: file, content: content };
    } catch (error) {
      handleError(new Error(`Error reading file "${file}": ${(error as Error).message}`), { throw: true });
      return null;
    }
  }).filter(item => item !== null) as Array<VueFile>;
}

/**
 * Reads files of a specific type from a directory and returns an object containing
 * the original file name and its stringified content.
 * @param dirPath - The path to the directory.
 * @param fileType - The desired file extension (e.g., '.txt').
 * @returns An array of objects, each containing a filename and its content.
 */
export function getVueFileContents(dirPath: string, fileType: string): Array<VueFile> {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory "${dirPath}" does not exist.`);
  }

  const matchedFiles = filterFilesByType(dirPath, fileType);

  if (matchedFiles.length === 0) {
    throw new Error(`No files of type "${fileType}" found in the directory "${dirPath}".`);
  }

  return processMatchedFiles(matchedFiles, dirPath);
}
