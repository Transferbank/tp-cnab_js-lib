import { CnabFormat } from '@cnab/type/cnab-format'
import { BancoDoBrasilBoletoEmailField } from '@cnab/bank/banco-do-brasil/banco-do-brasil-boleto-email-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BancoDoBrasilBoletoEmailField extends BancoDoBrasilBoletoEmailField {
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [4, 139]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '01')
  }
}
