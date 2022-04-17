import { Account } from "@/customer/domain/account"

export interface AccountRepository {
  findAccountByGuid(guid: string): Promise<Account | null>
}
