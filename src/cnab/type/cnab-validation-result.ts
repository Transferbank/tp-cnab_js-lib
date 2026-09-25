import { CnabValidationError } from '@cnab/type/cnab-validation-error'

export interface CnabValidationResult {
  isValid: boolean
  errors: CnabValidationError[]
  // Só vem preenchido quando o chamador pede feedback completo (withFeedback: true) -
  // no modo eager (padrão) sai caro à toa, já que quem só quer um isValid rápido
  // não usa essa quebra por boleto.
  boletos?: CnabBoletoValidationResult[]
}

export interface CnabBoletoValidationResult extends CnabValidationResult {
  index: number
  lineNumbers: number[]
}
