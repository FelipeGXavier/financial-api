import { Request, Router, Response } from "express"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { connection } from "@/shared/defaultDatasource"
import { TransactionRequest } from "./types/transactionRequest"
import { WalletTransactionService } from "@/transaction/application/usecases/walletTransactionService"

export const transactionRouter = Router()

export class TransactionController {
  constructor(private readonly transactionService: WalletTransactionService) {}

  public transaction = async (req: Request, res: Response) => {
    // @TODO check types
    const transactionRequest: TransactionRequest = req.body
    console.log(transactionRequest)
    const result = await this.transactionService.walletTransaction(
      transactionRequest
    )
    if (result.isRight()) {
      return res.sendStatus(200)
    }
    return res
      .status(422)
      .json({ success: false, message: result.value.message })
  }
}

const s = new WalletTransactionService(new WalletRepositoryImpl(connection))

const walletController = new TransactionController(s)

transactionRouter.post("/transaction", walletController.transaction)
