import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { connection } from "@/shared/defaultDatasource"
import { LoadWalletService } from "@/transaction/application/usecases/loadWalletService"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { WalletController } from "@/transaction/infra/web/walletController"
import { right, left, Either } from "@/shared/either"
import { Wallet } from "../src/transaction/domain/wallet"
import { Amount } from "@/transaction/domain/valueobject/amount"
import { WalletTransactionService } from "../src/transaction/application/usecases/walletTransactionService"
import { TransactionRequest } from "@/transaction/infra/web/types/transactionRequest"

async function test() {
  const s = new LoadWalletService(
    new AccountRepositoryImpl(connection),
    new WalletRepositoryImpl(connection)
  )

  const c = new WalletController(s)
}

class CustomErroName extends Error {}

function testEither(n: number): Either<CustomErroName, Boolean> {
  if (n <= 0) {
    return left(new CustomErroName("error"))
  }
  return right(true)
}

const res = testEither(1)

if (res.isLeft()) {
  console.error(`Error ${res.value.message}`)
} else {
  console.log(`Success ${res.value}`)
}

test()

const w1 = new Wallet({
  account: 1,
  guid: "c0afc414-1b85-4266-aa6f-4da28acff938",
  amount: Amount.of(10),
  primaryWallet: true,
})

const w2 = new Wallet({
  account: 2,
  guid: "b30d796d-e4ec-4f5d-8365-74d817590e4f",
  amount: Amount.of(11),
  primaryWallet: true,
})

const resw = w1.deposit(Amount.of(1), w2)
console.dir(resw, { depth: null })

const t = async () => {
  const s = new WalletTransactionService(new WalletRepositoryImpl(connection))
  const r: TransactionRequest = {
    payer: "c0afc414-1b85-4266-aa6f-4da28acff938",
    payee: "b30d796d-e4ec-4f5d-8365-74d817590e4f",
    value: 3,
  }
  await s.walletTransaction(r)
}

t()
