import { Request, Router, Response } from "express"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"
import { LoadWalletService } from "@/transaction/application/usecases/loadWalletService"
import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { connection } from "@/shared/defaultDatasource"
import { TransactionRequest } from "./types/transactionRequest"

export const transactionRouter = Router()

export class TransactionController {
  constructor(private readonly walletService: LoadWallet) {}

  public transaction = async (req: Request, res: Response) => {
    // @TODO check types
    const transactionRequest: TransactionRequest = req.body

    return res.sendStatus(200)
  }
}

const s = new LoadWalletService(
  new AccountRepositoryImpl(connection),
  new WalletRepositoryImpl(connection)
)

const walletController = new TransactionController(s)

transactionRouter.post("/transaction", walletController.transaction)
