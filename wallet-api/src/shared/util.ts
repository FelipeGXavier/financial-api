import { CustomDomainError } from "./errors/customError"

export const isCustomError = (target: any): target is CustomDomainError => {
  return target instanceof CustomDomainError
}
