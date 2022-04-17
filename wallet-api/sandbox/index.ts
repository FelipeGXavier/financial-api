import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { connection } from "@/shared/defaultDatasource"
import { LoadWalletService } from "@/transaction/application/usecases/loadWalletService"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { request, response } from "express"
import { WalletController } from "../src/transaction/infra/web/walletController"

async function test() {
  const s = new LoadWalletService(
    new AccountRepositoryImpl(connection),
    new WalletRepositoryImpl(connection)
  )

  const c = new WalletController(s)

  console.log(c.loadWallet(request, response))
}

test()
