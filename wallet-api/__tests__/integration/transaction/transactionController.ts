import { app } from "__tests__/config/globalSetupServer"
import { connection } from "@/shared/defaultDatasource"
import { randomUUID } from "crypto"
import { TransactionState } from "@/transaction/domain/transactionState"
import {
  getTransactionRecord,
  getWalletData,
  createSchemaAndMigrate,
  clearAllTables,
  createUserRetailerWithWallet,
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

  test("POST /api/transaction - Valid request should return 200", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 100,
      retailerWalletAmount: 100,
    })
    const result = await server.post("/api/transaction").send({
      payer: userRetailerData.userGuid,
      payee: userRetailerData.retailerGuid,
      value: 1,
    })
    const transactionRecord = await getTransactionRecord(
      userRetailerData.userWalletId,
      userRetailerData.retailerWalletId
    )
    const payerWallet = await getWalletData(userRetailerData.userWalletId)
    const payeeWallet = await getWalletData(userRetailerData.retailerWalletId)
    // Assert API response
    expect(result.statusCode).toEqual(200)
    // Assert create a transaction record with right amount and finished state
    expect(transactionRecord.length).toEqual(1)
    expect(transactionRecord[0].amount).toEqual("1")
    expect(transactionRecord[0].state).toEqual(TransactionState.Finished)
    // Assert new wallets amount after transaction
    expect(payerWallet?.amount).toEqual("99")
    expect(payerWallet?.account_id).toEqual(userRetailerData.userAccountId)
    expect(payeeWallet?.amount).toEqual("101")
    expect(payeeWallet?.account_id).toEqual(userRetailerData.retailerAccountId)
  })

  test("POST /api/transaction - Payer without necessary amount should return 422", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 100,
      retailerWalletAmount: 100,
    })
    const result = await server.post("/api/transaction").send({
      payer: userRetailerData.userGuid,
      payee: userRetailerData.retailerGuid,
      value: 101,
    })
    const transactionRecord = await getTransactionRecord(
      userRetailerData.userWalletId,
      userRetailerData.retailerWalletId
    )
    const payerWallet = await getWalletData(userRetailerData.userWalletId)
    const payeeWallet = await getWalletData(userRetailerData.retailerWalletId)
    // Assert API response
    expect(result.statusCode).toEqual(422)
    expect(result.body.message).toEqual(
      "Payer doesn't have the necessary amount to exchange"
    )
    // Assert create a transaction record with right amount and failed state
    expect(transactionRecord.length).toEqual(1)
    expect(transactionRecord[0].amount).toEqual("101")
    expect(transactionRecord[0].state).toEqual(TransactionState.Failed)
    // Assert new wallets amount after transaction
    expect(payerWallet?.amount).toEqual("100")
    expect(payerWallet?.account_id).toEqual(userRetailerData.userAccountId)
    expect(payeeWallet?.amount).toEqual("100")
    expect(payeeWallet?.account_id).toEqual(userRetailerData.retailerAccountId)
  })

  test("POST /api/transaction - Payer or payee wallet not found should return 422", async () => {
    const fakePayeeGuid = randomUUID()
    const fakePayerGuid = randomUUID()
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 100,
      retailerWalletAmount: 100,
    })
    const resultPayerNotFound = await server.post("/api/transaction").send({
      payer: fakePayerGuid,
      payee: userRetailerData.retailerGuid,
      value: 1,
    })
    const resultPayeeNotFound = await server.post("/api/transaction").send({
      payer: userRetailerData.userGuid,
      payee: fakePayeeGuid,
      value: 1,
    })
    const transactionRecord = await getTransactionRecord(
      userRetailerData.userWalletId,
      userRetailerData.retailerWalletId
    )
    const payerWallet = await getWalletData(userRetailerData.userWalletId)
    const payeeWallet = await getWalletData(userRetailerData.retailerWalletId)
    // Assert API response
    expect(resultPayerNotFound.statusCode).toEqual(422)
    expect(resultPayerNotFound.body.message).toEqual("Payer wallet not found")
    expect(resultPayeeNotFound.statusCode).toEqual(422)
    expect(resultPayeeNotFound.body.message).toEqual("Payee wallet not found")
    // Assert transaction record wasn't created
    expect(transactionRecord.length).toEqual(0)
    // Assert new wallets amount after transaction
    expect(payerWallet?.amount).toEqual("100")
    expect(payerWallet?.account_id).toEqual(userRetailerData.userAccountId)
    expect(payeeWallet?.amount).toEqual("100")
    expect(payeeWallet?.account_id).toEqual(userRetailerData.retailerAccountId)
  })

  test("POST /api/transaction - Trying transaction with retailer as payer should return 422", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 100,
      retailerWalletAmount: 100,
    })
    const result = await server.post("/api/transaction").send({
      payer: userRetailerData.retailerGuid,
      payee: userRetailerData.userGuid,
      value: 1,
    })
    const transactionRecord = await getTransactionRecord(
      userRetailerData.userWalletId,
      userRetailerData.retailerWalletId
    )
    const payerWallet = await getWalletData(userRetailerData.userWalletId)
    const payeeWallet = await getWalletData(userRetailerData.retailerWalletId)
    // Assert API response
    expect(result.statusCode).toEqual(422)
    expect(result.body.message).toEqual("Payer must not be a retailer")
    // Assert transaction record wasn't created
    expect(transactionRecord.length).toEqual(0)
    // Assert new wallets amount after transaction
    expect(payerWallet?.amount).toEqual("100")
    expect(payerWallet?.account_id).toEqual(userRetailerData.userAccountId)
    expect(payeeWallet?.amount).toEqual("100")
    expect(payeeWallet?.account_id).toEqual(userRetailerData.retailerAccountId)
  })
})
