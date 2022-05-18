import { connection } from "@/shared/defaultDatasource"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { FraudCheckService } from "@/transaction/infra/service/fraudCheckServiceMock"
import { SendTransactionMessage } from "@/transaction/infra/service/sendTransactionMessageMock"
import { WalletTransactionService } from "@/transaction/application/usecases/walletTransactionService"

export const transactionServiceInstance = (
  con = connection,
  walletRepo = new WalletRepositoryImpl(con),
  fraudService = new FraudCheckService(),
  sendTransactionMessageService = new SendTransactionMessage()
) => {
  return new WalletTransactionService(
    walletRepo,
    sendTransactionMessageService,
    fraudService
  )
}
