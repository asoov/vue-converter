import * as fs from 'fs';
import * as path from 'path';

/**
 * Copies files from the source directory to the destination directory, matching a specific file extension.
 * It will ignore files or directories within any `node_modules` subdirectory.
 * The files are copied into a flat structure, i.e., it won't preserve the folder structure of the source directory.
 *
 * @param {string} srcDir - The source directory path from which files will be copied.
 * @param {string} destDir - The destination directory path where files will be copied to.
 * @param {string} fileExtension - The file extension to match. E.g., '.txt' or '.vue'.
 * @throws {Error} If there's an issue accessing the file system.
 */

export const copyFiles = (srcDir: string, destDir: string, fileExtension: string) => {
  // Ensure the destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const items = fs.readdirSync(srcDir);

  items.forEach(item => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, path.basename(item));

    // Ignore node_modules directory
    if (srcPath.includes('node_modules')) {
      return;
    }

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyFiles(srcPath, destDir, fileExtension); // Keep the destDir unchanged for flat structure
    } else if (path.extname(srcPath) === fileExtension) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} to ${destPath}`);
    }
  });
};