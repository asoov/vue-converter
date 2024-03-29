import fs from 'fs';
import path from 'path';

export const writeFileWithContent = (
  filename: string,
  content: string,
  directory: string
): void => {
  const fullPath = path.join(directory, filename);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFile(fullPath, content, 'utf8', (error) => {
    if (error) {
      console.error(`Error writing to file ${fullPath}:`, error.message);
      return;
    }
    console.log(`File ${fullPath} has been written successfully.`);
  });
}
