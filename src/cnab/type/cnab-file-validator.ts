import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

// Validações que dependem de mais de uma linha do arquivo, como a sequência dos registros
export interface CnabFileValidator {
  validate(rawLines: string[]): CnabValidationResult
}
