type HandleErrorOptions = {
  throw: boolean
}

export const handleError = (error: unknown, handleErrorOptions: HandleErrorOptions = { throw: false }) => {
  if (error instanceof Error) {
    handleErrorOfTypeError(error, handleErrorOptions.throw)
  } else {
    console.error(error);
  }
}

const handleErrorOfTypeError = (error: Error, throwError: boolean) => {
  if (throwError) {
    throw new Error(error.message)
  }
  console.error(error.message)
}