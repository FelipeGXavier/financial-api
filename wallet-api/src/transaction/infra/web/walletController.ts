import { Request, Router, Response } from "express"
import { LoadWallet } from "@/transaction/application/contracts/loadWallet"

export class WalletController {
  constructor(private readonly walletService: LoadWallet) {}

  public loadWallet = async (req: Request, res: Response) => {
    const { id } = req.params
    const wallet = await this.walletService.loadWalletByAccountGuid(id)
    if (wallet.isLeft()) {
      res.status(400).send({ success: false, message: wallet.value.message })
      return
    }
    res.send({ success: true, wallet: wallet.value })
  }
}
