import { CnabFormat } from '@cnab/type/cnab-format'
import { BancoDoBrasilBoletoEmailField } from '@cnab/bank/banco-do-brasil/banco-do-brasil-boleto-email-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BancoDoBrasilBoletoEmailSegmentoYField extends BancoDoBrasilBoletoEmailField {
  static readonly format = CnabFormat.CNAB240
  readonly range: [number, number] = [20, 69]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, '03', '4')
  }
}
