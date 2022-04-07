export class Amount {
  private readonly amount: number

  constructor(amount: number) {
    this.amount = amount
  }

  public getAmount() {
    return this.amount
  }
}
