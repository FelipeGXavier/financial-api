import { Request, Router, Response } from "express"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"
import { LoadWalletService } from "@/transaction/application/usecases/loadWalletService"
import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { connection } from "@/shared/defaultDatasource"
import { TransactionRequest } from "./types/transactionRequest"
import asyncHandler from "express-async-handler"

export const walletRouter = Router()

export class WalletController {
  constructor(private readonly walletService: LoadWallet) {}

  public loadWallet = async (req: Request, res: Response) => {
    const { id } = req.params
    const wallet = await this.walletService.loadWalletByAccountId(id)
    if (wallet.isLeft()) {
      res.send({ success: false, message: wallet.value.message }).status(400)
    }
    res.send({ success: true, wallet: wallet.value })
  }
}

const s = new LoadWalletService(
  new AccountRepositoryImpl(connection),
  new WalletRepositoryImpl(connection)
)

const walletController = new WalletController(s)

walletRouter.get("/wallet/:id", asyncHandler(walletController.loadWallet))
