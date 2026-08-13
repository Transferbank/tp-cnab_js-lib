import { CnabException } from './cnab-exception'

export class CnabFileInsufficientLinesException extends CnabException {
  readonly code = 'CNAB_FILE_INSUFFICIENT_LINES'

  constructor(lineCount: number) {
    super(`Arquivo CNAB deve ter pelo menos 3 linhas. Recebido: ${lineCount}`)
  }
}

export class CnabFileInvalidFormatException extends CnabException {
  readonly code = 'CNAB_FILE_INVALID_FORMAT'

  constructor(lineLength: number) {
    super(`Formato CNAB inválido. Tamanho da linha: ${lineLength}. Esperado: 240 ou 400`)
  }
}
