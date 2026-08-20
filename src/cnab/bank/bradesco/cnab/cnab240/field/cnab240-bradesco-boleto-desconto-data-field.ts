import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoDescontoDataField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data limite desconto'
  readonly range: [number, number] = [118, 125]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.parse()
    const errors: CnabValidationError[] = []
    
    // "00000000" é válido (indica sem desconto)
    if (value === '00000000') {
      return { isValid: true, errors }
    }
    
    const isValid = parseDateDDMMAAAA(value) !== null

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data limite desconto inválido: deve ser data no formato DDMMAAAA ou "00000000"',
          lineNumber: this.lineNumber,
          fieldName: this.fieldName,
          range: this.range
        })
      )
    }

    return {
      isValid,
      errors
    }
  }

  parse(): string {
    return this.getRangeValue()
  }
}
