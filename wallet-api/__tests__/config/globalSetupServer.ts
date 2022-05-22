import Server from "@/Server"
import errorHandler from "@/shared/errors/errorHandler"
import { loadWalletServiceInstance } from "@/transaction/application/factory/loadWalletService"
import { transactionServiceInstance } from "@/transaction/application/factory/transactionServiceFactory"
import { transactionRoutes, walletRoutes } from "@/transaction/infra/web/routes"
import { TransactionController } from "@/transaction/infra/web/transactionController"
import { WalletController } from "@/transaction/infra/web/walletController"
import { Router } from "express"
import request from "supertest"

const baseRouter = Router()
const server = new Server()

baseRouter.use(
  "/api",
  walletRoutes(new WalletController(loadWalletServiceInstance())),
  transactionRoutes(new TransactionController(transactionServiceInstance()))
)
baseRouter.get("/ping", (req, res) => {
  return res.sendStatus(200)
})

baseRouter.use(errorHandler)

server.addRouter(baseRouter)

export const app = request(server.getApp())
