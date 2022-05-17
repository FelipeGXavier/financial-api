import { Amount } from "@/transaction/domain/valueobject/amount"
describe("Amount value object", () => {
  test("zero amount", () => {
    expect(Amount.of(0).getAmount()).toEqual(0)
    expect(Amount.of(0.0).getAmount()).toEqual(0.0)
  })

  test("positive amount", () => {
    expect(Amount.of(1).getAmount()).toEqual(1)
    expect(Amount.of(1.5).getAmount()).toEqual(1.5)
    expect(Amount.of(Number.MAX_SAFE_INTEGER).getAmount()).toEqual(
      Number.MAX_SAFE_INTEGER
    )
  })

  test("negative amount", () => {
    expect(() => Amount.of(-1)).toThrow("Illegal amount value")
    expect(() => Amount.of(-Number.MIN_VALUE)).toThrow("Illegal amount value")
  })
})
