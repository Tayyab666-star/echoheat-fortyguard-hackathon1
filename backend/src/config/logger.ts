import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const NODE_ENV = process.env.NODE_ENV || "development"
const LOG_LEVEL = process.env.LOG_LEVEL || "info"

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack })
  }
  return info
})

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""
    return `${timestamp as string} ${level}: ${message as string}${metaStr}`
  })
)

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  enumerateErrorFormat(),
  winston.format.json()
)

const transports: winston.transport[] = [
  new DailyRotateFile({
    dirname: "logs",
    filename: "app-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
  }),
]

if (NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  )
}

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels: winston.config.npm.levels,
  transports,
})

export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}
