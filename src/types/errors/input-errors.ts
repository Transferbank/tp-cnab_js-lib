import { CNABInputError } from './base'
import { CNABFormatCode } from '@/types/core/cnab'


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


export class CNABNoLinesProvidedError extends CNABInputError {
  readonly code = 'NO_LINES_PROVIDED'

  constructor() {
    super(
      'Nenhuma linha fornecida para detecção de formato. ' +
        'Verifique se o array de linhas não está vazio ou null/undefined'
    )
  }
}

export class CNABInvalidHeaderError extends CNABInputError {
  readonly code = 'INVALID_HEADER'
  readonly reason: 'empty' | 'null' | 'undefined'

  constructor(headerLine: string | null | undefined) {
    let reason: 'empty' | 'null' | 'undefined'
    let message: string

    if (headerLine === null) {
      reason = 'null'
      message = 'Header fornecido é null. Verifique se o arquivo CNAB possui pelo menos uma linha de header'
    } else if (headerLine === undefined) {
      reason = 'undefined'
      message = 'Header não fornecido (undefined). Verifique se o arquivo CNAB possui pelo menos uma linha de header'
    } else {
      reason = 'empty'
      message = 'Header vazio. Arquivo CNAB deve conter um header válido com 240 ou 400 caracteres'
    }

    super(message)
    this.reason = reason
  }
}
