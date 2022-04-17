import { Account } from "@/customer/domain/account"
import { AccountRepository } from "@/customer/infra/contracts/accountRepository"
import { Knex } from "knex"

export class AccountRepositoryImpl implements AccountRepository {
  private readonly table = "accounts"

  constructor(private readonly connection: Knex) {}

  async findAccountByGuid(guid: string): Promise<Account | null> {
    const accountContent = await this.connection(this.table)
      .select("id", "guid", "name", "password", "email")
      .where("guid", guid)
      .first()
    if (accountContent) {
      return new Account({
        id: accountContent.id,
        guid: accountContent.guid,
        name: accountContent.name,
        password: accountContent.password,
        email: accountContent.emal,
      })
    }
    return null
  }
}
