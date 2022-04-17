import { Router } from "express"
import Server from "./Server"
import { walletRouter } from "./transaction/infra/web/walletController"

const baseRouter = Router()

const server = new Server()

baseRouter.use("/api", walletRouter)

baseRouter.get("/ping", (req, res) => {
  return res.send(200)
})

server.addRouter(baseRouter)
server.start(3000)
