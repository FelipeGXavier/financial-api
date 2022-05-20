import { app } from "__tests__/config/globalSetupServer"
import { connection } from "@/shared/defaultDatasource"
import {
  createSchemaAndMigrate,
  clearAllTables,
} from "__tests__/fixture/databaseUtils"

const server = app

describe("TransactionController", () => {
  beforeAll(async () => {
    await createSchemaAndMigrate()
  })

  beforeEach(async () => {
    await clearAllTables()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  test("GET /ping", async () => {
    const result = await server.get("/ping")
    expect(result.statusCode).toEqual(200)
  })
})
