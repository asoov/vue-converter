import { rimraf } from 'rimraf'

export const clearDirectory = async (directoryPath: string): Promise<void> => {
  await rimraf(directoryPath)
}