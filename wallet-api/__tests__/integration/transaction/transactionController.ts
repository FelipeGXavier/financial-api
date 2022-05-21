import { app } from "__tests__/config/globalSetupServer"
import { connection } from "@/shared/defaultDatasource"
import { randomUUID } from "crypto"
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

  test("POST /api/transaction - Invalid parameters should return bad request", async () => {
    const payeeGuid = randomUUID()
    const payerGuid = randomUUID()
    // Undefined value
    const reqUndefinedValue = { payee: payeeGuid, payer: payerGuid }
    // Undefined payee
    const reqUndefinedPayee = { payer: payerGuid, value: 1 }
    // Undefined payer
    const reqUndefinedPayer = { payee: payeeGuid, value: 1 }
    // Invalid uuid
    const reqInvalidGuid = { payee: "", payer: "", value: 1 }
    // Negative amount
    const reqNegativeAmount = { payee: payeeGuid, value: -1 }
    const badRequestMessage = "Invalid transaction parameters"
    const valuesToBeTested = [
      reqUndefinedValue,
      reqUndefinedPayee,
      reqUndefinedPayer,
      reqInvalidGuid,
      reqNegativeAmount,
    ]
    valuesToBeTested.forEach(async body => {
      const result = await server.post("/api/transaction").send(body)
      expect(result.statusCode).toEqual(400)
      expect(result.body.message).toEqual(badRequestMessage)
    })
  })
})
