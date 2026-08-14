export abstract class CnabException extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class CnabMinimumLinesNotReachedException extends CnabException {
  constructor() {
    super('Arquivo CNAB inválido: esperado ao menos 3 linhas')
  }
}

export class CnabFormatNotRecognizedException extends CnabException {
  constructor(lineLength: number) {
    super(
      `Formato CNAB não reconhecido. Primeira linha tem ${lineLength} caracteres. Esperado: 240 ou 400`
    )
  }
}

export class CnabBankCodeNotFoundException extends CnabException {
  constructor(bankCode: string, cnabFormat: number) {
    super(
      `Código do banco não encontrado: ${bankCode} para o CNAB${cnabFormat}`
    )
  }
}

export class CnabBankSchemaNotFoundException extends CnabException {
  constructor(bank: string, cnabFormat: number) {
    super(`CNAB${cnabFormat} para o banco ${bank} não suportado`)
  }
}