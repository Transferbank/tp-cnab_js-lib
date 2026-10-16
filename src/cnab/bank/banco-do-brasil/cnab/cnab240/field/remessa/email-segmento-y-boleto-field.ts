import { CnabFormat } from '@cnab/type/cnab-format'
import { EmailBoletoField as BancoDoBrasilBaseEmailBoletoField } from '@cnab/bank/banco-do-brasil/email-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class EmailSegmentoYBoletoField extends BancoDoBrasilBaseEmailBoletoField {
  static readonly format = CnabFormat.CNAB240
  readonly range: [number, number] = [20, 69]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, '03', '4')
  }
}
