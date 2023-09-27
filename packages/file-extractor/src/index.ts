import { copyFiles } from "./copyFiles";
import { executeApiRequest } from "./executeApiRequest";
import { getVueFileContents } from "./getVueFileContents";
import { rimraf } from 'rimraf'
import { writeFileWithContent } from "./writeVueFile";


async function main() {
  const srcDirectory = process.argv[2];
  const destDirectory = process.argv[3];

  if (!srcDirectory || !destDirectory) {
    console.error('Please provide source and destination directories.');
    process.exit(1);
  }

  await rimraf(destDirectory)
  console.log('Destination folder cleared')
  copyFiles(srcDirectory, destDirectory, '.vue');

  const fileContents = getVueFileContents(destDirectory, '.vue')

  const data = await executeApiRequest(fileContents)
  console.log('DATA', data)
  if (data?.generatedVueFiles?.length) {
    await rimraf('./generated')
    data?.generatedVueFiles.forEach(generatedVueFile => {
      console.log(generatedVueFile)
      writeFileWithContent(generatedVueFile.fileName, generatedVueFile.content, './generated')
    })
  }

  console.log('Copying process completed.');
}

main()
