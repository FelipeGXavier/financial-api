import axios from "axios"

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
        console.log(`Message succesfully sent to transaction #${transactionId}`)
      } else {
        console.log(
          `Notify service wasn't sucessfully to send transaction message #${transactionId}`
        )
      }
    } catch (err) {
      console.error(
        `Error ocurred while sending request to notify transaction success #${transactionId}`,
        err
      )
    }
  }
}
