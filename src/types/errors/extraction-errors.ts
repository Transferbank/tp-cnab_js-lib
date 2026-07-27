/**
 * Exceptions para erros de extração canônica (CNABInputError).
 * Erros durante o processo de interpret() de campos CNAB.
 */

import { CNABInputError } from './base'

/**
 * Código não reconhecido para um campo durante extração canônica.
 * Lançado quando interpret() retorna undefined para um valor não-zero/não-vazio.
 */
export class CNABUnknownFieldCodeError extends CNABInputError {
  readonly code = 'UNKNOWN_FIELD_CODE'
  readonly fieldName: string
  readonly rawValue: string | number

  constructor(fieldName: string, rawValue: string | number) {
    super(`Código não reconhecido para o campo "${fieldName}": ${rawValue}`)
    this.fieldName = fieldName
    this.rawValue = rawValue
  }
}
