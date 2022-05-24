import * as Yup from "yup"

export type TransactionRequest = {
  value: number
  payer: string
  payee: string
}

export const TransactionRequestSchema = Yup.object().shape({
  value: Yup.number().positive().required(),
  payer: Yup.string().uuid().required(),
  payee: Yup.string().uuid().required(),
})
