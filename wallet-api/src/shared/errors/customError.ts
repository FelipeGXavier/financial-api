export class CustomDomainError extends Error {
  public status = 400

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }

  public getStatus() {
    return this.status
  }
}
