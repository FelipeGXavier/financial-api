import { Request, Router, Response } from "express"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"
import { LoadWalletService } from "@/transaction/application/usecases/loadWalletService"
import { AccountRepositoryImpl } from "@/customer/infra/persistence/accountRepositoryImpl"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { connection } from "@/shared/defaultDatasource"

export const walletRouter = Router()

export class WalletController {
  constructor(private readonly walletService: LoadWallet) {}

  public loadWallet = async (req: Request, res: Response) => {
    const { id } = req.params
    const wallet = await this.walletService.loadWalletByAccountId(id)
    return res.send({ result: wallet })
  }
}

const s = new LoadWalletService(
  new AccountRepositoryImpl(connection),
  new WalletRepositoryImpl(connection)
)

const walletController = new WalletController(s)

walletRouter.get("/wallet", (req, res) => res.send({ ok: true }))
walletRouter.get("/wallet/:id", walletController.loadWallet)
