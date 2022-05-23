import { connection, databaseTransactionCtx } from "@/shared/defaultDatasource"
import { Amount } from "@/transaction/domain/valueobject/amount"
import { PayeePayerNewWallet, Wallet } from "@/transaction/domain/wallet"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"
import { WalletRepositoryImpl } from "@/transaction/infra/persistence/walletRepository"
import { randomUUID } from "crypto"
import { TransactionState } from "@/transaction/domain/transactionState"
import {
  clearAllTables,
  createSchemaAndMigrate,
  createUserRetailerWithWallet,
  getTransactionRecord,
} from "__tests__/fixture/databaseUtils"

const walletRepository: WalletRepository = new WalletRepositoryImpl(connection)

describe("WalletRepository", () => {
  beforeAll(async () => {
    await createSchemaAndMigrate()
  })

  beforeEach(async () => {
    await clearAllTables()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  test("findPrimaryWalletByAccountId return Wallet with right user type", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 1,
      retailerWalletAmount: 999,
    })
    const userWallet = await walletRepository.findPrimaryWalletByAccountId(
      userRetailerData.userAccountId
    )
    const retailerWallet = await walletRepository.findPrimaryWalletByAccountId(
      userRetailerData.retailerAccountId
    )
    expect(userWallet?.walletOwnerIsUser()).toBeTruthy()
    expect(userWallet?.getValue()).toEqual(1)
    expect(retailerWallet?.walletOwnerIsRetailer).toBeTruthy()
    expect(retailerWallet?.getValue()).toEqual(999)
  })

  test("findPrimaryWalletByAccountId return null with non-existing data as input", async () => {
    const wallet = await walletRepository.findPrimaryWalletByAccountId(1)
    expect(wallet).toBe(null)
  })

  test("findPrimaryWalletByAccountGuid return Wallet with right user type", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 1,
      retailerWalletAmount: 999,
    })
    const userWallet = await walletRepository.findPrimaryWalletByAccountGuid(
      userRetailerData.userGuid
    )
    const retailerWallet =
      await walletRepository.findPrimaryWalletByAccountGuid(
        userRetailerData.retailerGuid
      )
    expect(userWallet?.walletOwnerIsUser()).toBeTruthy()
    expect(userWallet?.getValue()).toEqual(1)
    expect(retailerWallet?.walletOwnerIsRetailer).toBeTruthy()
    expect(retailerWallet?.getValue()).toEqual(999)
  })

  test("findPrimaryWalletByAccountGuid return null with non-existing data as input", async () => {
    const wallet = await walletRepository.findPrimaryWalletByAccountGuid(
      randomUUID()
    )
    expect(wallet).toBe(null)
  })

  test("updateWalletAmount should update given wallet", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 1,
      retailerWalletAmount: 999,
    })
    const userWallet = await walletRepository.findPrimaryWalletByAccountId(
      userRetailerData.userAccountId
    )
    const retailerWallet = await walletRepository.findPrimaryWalletByAccountId(
      userRetailerData.retailerAccountId
    )
    const newWallets = userWallet?.deposit(
      Amount.of(1),
      retailerWallet as Wallet
    ).value as PayeePayerNewWallet
    expect(await walletRepository.updateWalletAmount(newWallets[0])).toEqual(1)
    expect(await walletRepository.updateWalletAmount(newWallets[1])).toEqual(1)
    const resultPayerWalletUpdate =
      await walletRepository.findPrimaryWalletByAccountId(
        userRetailerData.userAccountId
      )
    const resultPayeeWalletUpdate =
      await walletRepository.findPrimaryWalletByAccountId(
        userRetailerData.retailerAccountId
      )
    expect(resultPayerWalletUpdate?.getValue()).toEqual(0)
    expect(resultPayeeWalletUpdate?.getValue()).toEqual(1000)
  })

  test("updateWalletAmount should respect database transaction context when provided", async () => {
    const trx = await databaseTransactionCtx()
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 1,
      retailerWalletAmount: 999,
    })
    const userWallet = await walletRepository.findPrimaryWalletByAccountId(
      userRetailerData.userAccountId
    )
    const retailerWallet = await walletRepository.findPrimaryWalletByAccountId(
      userRetailerData.retailerAccountId
    )
    const newWallets = userWallet?.deposit(
      Amount.of(1),
      retailerWallet as Wallet
    ).value as PayeePayerNewWallet
    expect(
      await walletRepository.updateWalletAmount(newWallets[0], trx)
    ).toEqual(1)
    expect(
      await walletRepository.updateWalletAmount(newWallets[1], trx)
    ).toEqual(1)
    // Revert update
    await trx.rollback()
    const resultPayerWalletUpdate =
      await walletRepository.findPrimaryWalletByAccountId(
        userRetailerData.userAccountId
      )
    const resultPayeeWalletUpdate =
      await walletRepository.findPrimaryWalletByAccountId(
        userRetailerData.retailerAccountId
      )
    expect(resultPayerWalletUpdate?.getValue()).toEqual(1)
    expect(resultPayeeWalletUpdate?.getValue()).toEqual(999)
  })

  test("saveWalletTransactionRegister should create transaction record with 'pending' state as default", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 999,
      retailerWalletAmount: 1,
    })
    expect(
      (
        await walletRepository.saveWalletTransactionRegister(
          999,
          userRetailerData.userAccountId,
          userRetailerData.retailerAccountId
        )
      )?.length
    ).toEqual(1)
    const transactionRecord = await getTransactionRecord(
      userRetailerData.userWalletId,
      userRetailerData.retailerWalletId
    )
    expect(transactionRecord[0].amount).toEqual("999")
    expect(transactionRecord[0].state).toEqual(TransactionState.Pending)
  })

  test("saveWalletTransactionRegister should respect database transaction context when provided", async () => {
    const trx = await databaseTransactionCtx()
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 999,
      retailerWalletAmount: 1,
    })
    expect(
      (
        await walletRepository.saveWalletTransactionRegister(
          999,
          userRetailerData.userAccountId,
          userRetailerData.retailerAccountId,
          trx
        )
      )?.length
    ).toEqual(1)
    await trx.rollback()
    const transactionRecord = await getTransactionRecord(
      userRetailerData.userWalletId,
      userRetailerData.retailerWalletId
    )
    expect(transactionRecord.length).toEqual(0)
  })

  test("updateWalletTransactionState should update transaction record state", async () => {
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 999,
      retailerWalletAmount: 1,
    })
    const transactionId = (
      (await walletRepository.saveWalletTransactionRegister(
        999,
        userRetailerData.userAccountId,
        userRetailerData.retailerAccountId
      )) as number[]
    )[0]
    await walletRepository.updateWalletTransactionState(
      transactionId,
      TransactionState.Finished
    )
    expect(
      (
        await getTransactionRecord(
          userRetailerData.userWalletId,
          userRetailerData.retailerWalletId
        )
      )[0].state
    ).toEqual(TransactionState.Finished)
    await walletRepository.updateWalletTransactionState(
      transactionId,
      TransactionState.Rejected
    )
    expect(
      (
        await getTransactionRecord(
          userRetailerData.userWalletId,
          userRetailerData.retailerWalletId
        )
      )[0].state
    ).toEqual(TransactionState.Rejected)
  })

  test("updateWalletTransactionState should respect database transaction context when provided", async () => {
    const trx = await databaseTransactionCtx()
    const userRetailerData = await createUserRetailerWithWallet({
      userWalletAmount: 999,
      retailerWalletAmount: 1,
    })
    const transactionId = (
      (await walletRepository.saveWalletTransactionRegister(
        999,
        userRetailerData.userAccountId,
        userRetailerData.retailerAccountId
      )) as number[]
    )[0]
    await walletRepository.updateWalletTransactionState(
      transactionId,
      TransactionState.Rejected,
      trx
    )
    await trx.rollback()
    expect(
      (
        await getTransactionRecord(
          userRetailerData.userWalletId,
          userRetailerData.retailerWalletId
        )
      )[0].state
    ).toEqual(TransactionState.Pending)
  })
})
