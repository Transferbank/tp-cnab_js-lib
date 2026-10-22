import { CnabFormat } from '@cnab/type/cnab-format'
import { EmailBoletoField as BancoDoBrasilBaseEmailBoletoField } from '@cnab/bank/banco-do-brasil/email-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class EmailBoletoField extends BancoDoBrasilBaseEmailBoletoField {
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [4, 139]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '01')
  }
}
