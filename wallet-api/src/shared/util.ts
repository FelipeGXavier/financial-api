import { CustomDomainError } from "./errors/customError"

export const isCustomError = (target: any): target is CustomDomainError => {
  return target instanceof CustomDomainError
}

export const headOrUndefined = <T>(input: T[] | undefined): T | undefined => {
  if (input != undefined && input.length > 0) {
    return input[0]
  }
  return undefined
}
