import { isCustomError } from "@/shared/util"
import { CustomDomainError } from "@/shared/errors/customError"
import { Either, right, left } from "@/shared/either"

describe("Util isCustomError", () => {
  it("null type should return false", () => {
    expect(isCustomError(null)).toBeFalsy()
  })
  it("not a CustomDomainError type should return false", () => {
    expect(isCustomError({})).toBeFalsy()
  })
  it("valid CustomDomainError type should return true", () => {
    expect(isCustomError(new CustomDomainError("Error"))).toBeTruthy()
  })
})

describe("Either type", () => {
  test("isRight", () => {
    const either: Either<boolean, number> = right(1)
    expect(either.isRight()).toBeTruthy()
    expect(either.isLeft()).toBeFalsy()
    expect(either.value).toBe(1)
  })
  test("isLeft", () => {
    const either: Either<boolean, number> = left(false)
    expect(either.isRight()).toBeFalsy()
    expect(either.isLeft()).toBeTruthy()
    expect(either.value).toBe(false)
  })
})
