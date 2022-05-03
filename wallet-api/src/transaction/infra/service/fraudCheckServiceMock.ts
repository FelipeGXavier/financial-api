import axios from "axios"
import Logger from "@/shared/logger"

type ServiceResponse = {
  message: string
}
export class FraudCheckService {
  private readonly baseMockUrl = "https://run.mocky.io"
  private readonly fraudCheckPath = "/v3/8fafdd68-a090-496f-8c9a-3442cf30dae6"

  public async checkTransaction(): Promise<boolean> {
    try {
      const response = (
        await axios.get<ServiceResponse>(
          `${this.baseMockUrl}${this.fraudCheckPath}`
        )
      ).data
      if (
        response.message &&
        response.message.toLocaleLowerCase() == "autorizado"
      ) {
        return true
      }
      return false
    } catch (err) {
      Logger.error(`Error while requesting external fraud service`, err)
      return false
    }
  }
}
