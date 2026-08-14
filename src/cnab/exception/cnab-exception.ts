export abstract class CnabException extends Error {
  abstract code: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class CnabFileInsufficientLinesException extends CnabException {
  code = 'CNAB_FILE_INSUFFICIENT_LINES'

  constructor(lineCount: number) {
    super(`Arquivo CNAB deve ter pelo menos 3 linhas. Recebido: ${lineCount}`)
  }
}

export class CnabFileInvalidFormatException extends CnabException {
  code = 'CNAB_FILE_INVALID_FORMAT'

  constructor(lineLength: number) {
    super(`Formato CNAB inválido. Tamanho da linha: ${lineLength}. Esperado: 240 ou 400`)
  }
}

export class CnabFileUnsupportedBankException extends CnabException {
  code = 'CNAB_FILE_UNSUPPORTED_BANK'

  constructor(bankCode: string) {
    super(`Banco não suportado. Código do banco: ${bankCode}`)
  }
}
