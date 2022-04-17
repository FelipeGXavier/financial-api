export class Amount {
  private readonly amount: number

  private constructor(amount: number) {
    this.amount = amount
  }

  public static of(amount: number): Amount {
    if (amount < 0) {
      throw new Error("Illegal amount value")
    }
    return new Amount(amount)
  }

  public getAmount() {
    return this.amount
  }
}
