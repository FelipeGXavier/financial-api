import { Request, Router, Response, NextFunction } from "express"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { connection } from "@/shared/defaultDatasource"
import {
  TransactionRequest,
  TransactionRequestSchema,
} from "./types/transactionRequest"
import { WalletTransactionService } from "@/transaction/application/usecases/walletTransactionService"
import asyncHandler from "express-async-handler"
import { SendTransactionMessage } from "../service/sendTransactionMessageMock"
import { FraudCheckService } from "../service/fraudCheckServiceMock"

export const transactionRouter = Router()

export class TransactionController {
  constructor(private readonly transactionService: WalletTransactionService) {}

  public transaction = async (req: Request, res: Response) => {
    const transactionRequest: TransactionRequest = req.body
    if (!(await TransactionRequestSchema.isValid(transactionRequest))) {
      res
        .status(400)
        .json({ sucess: false, message: "Invalid transaction parameters" })
      return
    }
    const result = await this.transactionService.walletTransaction(
      transactionRequest
    )
    if (result.isRight()) {
      res.sendStatus(200)
      return
    }
    res.status(422).json({ success: false, message: result.value.message })
  }
}

const s = new WalletTransactionService(
  new WalletRepositoryImpl(connection),
  new SendTransactionMessage(),
  new FraudCheckService()
)

const walletController = new TransactionController(s)

transactionRouter.post(
  "/transaction",
  asyncHandler(walletController.transaction)
)
