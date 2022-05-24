import { app } from "__tests__/config/globalSetupServer"
import { connection } from "@/shared/defaultDatasource"
import { randomUUID } from "crypto"
import {
  createSchemaAndMigrate,
  clearAllTables,
  createUserRetailerWithWallet,
} from "__tests__/helpers/databaseUtils"

const server = app

describe("WalletController", () => {
  beforeAll(async () => {
    await createSchemaAndMigrate()
  })

  beforeEach(async () => {
    await clearAllTables()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  test("POST /api/wallet/:id - Request with nonexistent account id should return 400", async () => {
    const accountGuid = randomUUID()
    const result = await server.get(`/api/wallet/${accountGuid}`)
    expect(result.statusCode).toEqual(400)
    expect(result.body.message).toEqual("User not found from given user guid")
  })

  test("POST /api/wallet/:id - Wallet not found should return 400", async () => {
    const accountGuid = randomUUID()
    await connection("accounts").insert({
      guid: accountGuid,
      name: "John Doe",
      email: "john@doe.com",
      password: "123",
    })
    const result = await server.get(`/api/wallet/${accountGuid}`)
    expect(result.statusCode).toEqual(400)
    expect(result.body.message).toEqual(
      "Primary wallet not found from given user guid"
    )
  })

  test("POST /api/wallet/:id - Request with valid account and wallet should return wallet data and 200 as status code", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 999,
      retailerWalletAmount: 100,
    })
    const result = await server.get(`/api/wallet/${userRetailerData.userGuid}`)
    expect(result.statusCode).toEqual(200)
    expect(result.body).toEqual({
      success: true,
      wallet: {
        accountType: "user",
        guid: userRetailerData.userWalletGuid,
        id: userRetailerData.userWalletId,
        amount: 999,
        primaryWallet: true,
      },
    })
  })
})
