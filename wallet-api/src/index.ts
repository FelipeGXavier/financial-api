import { Router } from "express"
import Server from "./Server"
import { WalletController } from "./transaction/infra/web/walletController"
import errorHandler from "./shared/errors/errorHandler"
import morganMiddleware from "./config/requestLogger"
import { transactionRoutes, walletRoutes } from "./transaction/infra/web/routes"
import { TransactionController } from "./transaction/infra/web/transactionController"
import { transactionServiceInstance } from "./transaction/application/factory/transactionServiceFactory"
import { loadWalletServiceInstance } from "./transaction/application/factory/loadWalletService"

const baseRouter = Router()
const server = new Server()

server.addRouter(morganMiddleware)

baseRouter.use(
  "/api",
  walletRoutes(new WalletController(loadWalletServiceInstance())),
  transactionRoutes(new TransactionController(transactionServiceInstance()))
)

baseRouter.get("/ping", (req, res) => {
  return res.send(200)
})

baseRouter.use(errorHandler)
server.addRouter(baseRouter)

server
  .start(3000)
  .then(() => console.log("Server started"))
  .catch(err => {
    console.error("aaa", err)
  })
