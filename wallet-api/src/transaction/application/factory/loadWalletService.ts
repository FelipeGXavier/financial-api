import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { connection } from "@/shared/defaultDatasource"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { LoadWalletService } from "../usecases/loadWalletService"
import { formatter } from "@/transaction/infra/web/presentation/walletPresenter"

export const loadWalletServiceInstance = (
  con = connection,
  accountRepo = new AccountRepositoryImpl(con),
  walletRepo = new WalletRepositoryImpl(con)
) => {
  return new LoadWalletService(accountRepo, walletRepo, formatter.format)
}
