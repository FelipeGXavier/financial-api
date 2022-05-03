import { Router } from "express"
import Server from "./Server"
import { walletRouter } from "./transaction/infra/web/walletController"
import { transactionRouter } from "./transaction/infra/web/transactionController"
import errorHandler from "./shared/errors/errorHandler"
import morganMiddleware from "./config/requestLogger"

const baseRouter = Router()
const server = new Server()

server.addRouter(morganMiddleware)

baseRouter.use("/api", walletRouter, transactionRouter)

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
