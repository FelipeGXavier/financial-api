import { mock } from "jest-mock-extended"
import { WalletRepository } from "@/transaction/infra/contracts/walletRepository"

describe("TransactionService", () => {
  test("Mock", async () => {
    const mock1 = mock<WalletRepository>()
    mock1.saveWalletTransactionRegister.mockReturnValue(Promise.resolve(1))
    const d = await mock1.saveWalletTransactionRegister(1, 1, 1)
    expect(d).toEqual(1)
    expect(mock1.saveWalletTransactionRegister).toBeCalledTimes(1)
    expect(mock1.saveWalletTransactionRegister).toBeCalledWith(1, 1, 1)
  })
})
