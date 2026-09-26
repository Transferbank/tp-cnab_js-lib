import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BancoDoBrasilBoletoEnderecoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  // Nota do manual: obrigatório "principalmente naqueles casos em que o Banco quem faz
  // a distribuição dos bloquetos" - nos demais casos pode vir em branco.
  static readonly isOptional = true
  readonly fieldName = 'endereço do sacado'
  readonly range: [number, number] = [74, 113]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
