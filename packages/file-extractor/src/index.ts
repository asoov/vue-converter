import { copyFiles } from "./copyFiles";
import { getVueFileContents } from "./getVueFileContents";
import { rimraf } from 'rimraf'


const srcDirectory = process.argv[2];
const destDirectory = process.argv[3];

if (!srcDirectory || !destDirectory) {
  console.error('Please provide source and destination directories.');
  process.exit(1);
}

rimraf(destDirectory).then(() => console.log('Destination folder cleared'))
copyFiles(srcDirectory, destDirectory, '.vue');

const fileContents = getVueFileContents(destDirectory, '.vue')
console.log(fileContents)

console.log('Copying process completed.');
