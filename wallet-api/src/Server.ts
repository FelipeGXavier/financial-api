import express, { RequestHandler } from "express"

export default class Server {
  private readonly app

  constructor() {
    const server = express()
    server.use(express.json())
    this.app = server
  }

  start(port: number): Promise<unknown> {
    return new Promise(resolve => {
      resolve(this.app.listen(port))
    })
  }

  getApp() {
    return this.app
  }

  addRouter(
    router: express.Router | any,
    prefix?: string,
    ...middlewares: RequestHandler[]
  ): Server {
    if (prefix) {
      this.app.use(prefix, middlewares, router)
    } else {
      this.app.use(router, middlewares)
    }
    return this
  }
}
