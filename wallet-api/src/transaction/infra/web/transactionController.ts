import { Request, Response } from "express"

import { WalletTransactionService } from "@/transaction/application/usecases/walletTransactionService"
import {
  TransactionRequest,
  TransactionRequestSchema,
} from "@/transaction/infra/web/types/in/transactionRequest"
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
