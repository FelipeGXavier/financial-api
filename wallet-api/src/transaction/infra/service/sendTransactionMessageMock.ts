import axios from "axios"
import Logger from "@/shared/logger"

type ServiceResponse = {
  message: string
}
export class SendTransactionMessage {
  private readonly baseMockUrl = "http://o4d9z.mocklab.io"
  private readonly notifyPath = "/notify"

  public async sendMessage(transactionId: number): Promise<void> {
    try {
      const response = (
        await axios.get<ServiceResponse>(
          `${this.baseMockUrl}${this.notifyPath}`
        )
      ).data
      if (
        response.message &&
        response.message.toLocaleLowerCase() == "success"
      ) {
        Logger.info(`Message succesfully sent to transaction #${transactionId}`)
      } else {
        Logger.warn(
          `Notify service wasn't sucessfully to send transaction message #${transactionId}`
        )
      }
    } catch (err) {
      Logger.error(
        `Error ocurred while sending request to notify transaction success #${transactionId}`,
        err
      )
    }
  }
}
