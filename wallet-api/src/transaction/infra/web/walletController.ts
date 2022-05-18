import { Request, Router, Response } from "express"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"

export class WalletController {
  constructor(private readonly walletService: LoadWallet) {}

  public loadWallet = async (req: Request, res: Response) => {
    const { id } = req.params
    const wallet = await this.walletService.loadWalletByAccountId(id)
    if (wallet.isLeft()) {
      res.send({ success: false, message: wallet.value.message }).status(400)
      return
    }
    res.send({ success: true, wallet: wallet.value })
  }
}
