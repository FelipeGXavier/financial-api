export interface NamedAccountFields {
  id: number
  guid: string
  name: string
  password: string
  email: string
}

export class Account {
  private readonly id: number
  private readonly guid: string
  private readonly name: string
  private readonly password: string
  private readonly email: string

  constructor(parameters: NamedAccountFields) {
    this.id = parameters.id
    this.guid = parameters.guid
    this.name = parameters.name
    this.password = parameters.password
    this.email = parameters.email
  }

  public getId() {
    return this.id
  }

  public getGuid() {
    return this.guid
  }

  public getName() {
    return this.name
  }

  public getPassword() {
    return this.password
  }

  public getEmail() {
    return this.email
  }
}
