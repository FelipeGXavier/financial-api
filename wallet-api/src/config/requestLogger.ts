import morgan, { StreamOptions } from "morgan"
import Logger from "@/shared/logger"

const stream: StreamOptions = {
  write: message =>
    Logger.info(message.substring(0, message.lastIndexOf("\n"))),
}

const skip = () => {
  const env = process.env.NODE_ENV || "development"
  return false
}

const morganMiddleware = morgan(":method :url :status - :response-time ms", {
  stream,
  skip,
})

export default morganMiddleware
