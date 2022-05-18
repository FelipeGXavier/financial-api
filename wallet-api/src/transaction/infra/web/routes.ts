import { Router } from "express"
import { TransactionController } from "./transactionController"
import asyncHandler from "express-async-handler"
import { WalletController } from "./walletController"

export const transactionRoutes = (
  transactionController: TransactionController
) => {
  const transactionRouter = Router()
  transactionRouter.post(
    "/transaction",
    asyncHandler(transactionController.transaction)
  )
  return transactionRouter
}

export const walletRoutes = (walletController: WalletController) => {
  const walletRouter = Router()
  walletRouter.get("/wallet/:id", asyncHandler(walletController.loadWallet))
  return walletRouter
}
