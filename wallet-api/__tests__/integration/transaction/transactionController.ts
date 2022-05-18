import { app } from "__tests__/config/globalSetupServer"

const server = app

describe("TransactionController", () => {
  test("GET /ping", async () => {
    const result = await server.get("/ping")
    expect(result.statusCode).toEqual(200)
  })
})
