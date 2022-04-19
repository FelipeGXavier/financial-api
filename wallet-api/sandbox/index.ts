import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { connection } from "@/shared/defaultDatasource"
import { LoadWalletService } from "@/transaction/application/usecases/loadWalletService"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { WalletController } from "@/transaction/infra/web/walletController"
import { right, left, Either } from "@/shared/either"

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
