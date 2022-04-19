export const promisify = (fn: any) =>
  new Promise((resolve, reject) => fn(resolve))
