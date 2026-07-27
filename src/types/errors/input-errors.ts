/**
 * Exceptions concretas para erros de input (CNABInputError).
 * Erros causados por input inválido do consumidor em openCnab().
 */

import { CNABInputError } from './base'
import type { CNABFormatCode } from '../core'

/**
 * Arquivo CNAB vazio ou contém apenas linhas em branco.
 */
export class CNABEmptyFileError extends CNABInputError {
  readonly code = 'EMPTY_FILE'

  constructor() {
    super('Arquivo CNAB vazio ou contém apenas linhas em branco')
  }
}

/**
 * Formato CNAB não reconhecido (nem CNAB 240 nem CNAB 400).
 */
export class CNABFormatNotRecognizedError extends CNABInputError {
  readonly code = 'FORMAT_NOT_RECOGNIZED'
  readonly lineLength: number

  constructor(lineLength: number) {
    super(
      `Formato CNAB não reconhecido. ` +
        `Primeira linha tem ${lineLength} caracteres. ` +
        `Esperado: 240 (CNAB 240) ou 400 (CNAB 400)`
    )
    this.lineLength = lineLength
  }
}

/**
 * Código do banco não encontrado no header do arquivo.
 */
export class CNABBankNotFoundError extends CNABInputError {
  readonly code = 'BANK_NOT_FOUND'
  readonly format: CNABFormatCode

  constructor(format: CNABFormatCode) {
    super(
      `Código do banco não encontrado no header. ` +
        `Verifique se o arquivo está corretamente formatado como ${format.toUpperCase()}`
    )
    this.format = format
  }
}

/**
 * Banco não possui schema cadastrado para o formato especificado.
 */
export class CNABSchemaNotFoundError extends CNABInputError {
  readonly code = 'SCHEMA_NOT_FOUND'
  readonly bankCode: string
  readonly format: CNABFormatCode

  constructor(bankCode: string, format: CNABFormatCode) {
    const formatLabel = format === 'cnab240' ? 'CNAB 240' : 'CNAB 400'
    super(
      `Banco ${bankCode} não possui schema cadastrado para ${formatLabel}. ` +
        `Bancos suportados: consulte a documentação ou use validateCnabFile() ` +
        `para processar arquivos de bancos não cadastrados.`
    )
    this.bankCode = bankCode
    this.format = format
  }
}
