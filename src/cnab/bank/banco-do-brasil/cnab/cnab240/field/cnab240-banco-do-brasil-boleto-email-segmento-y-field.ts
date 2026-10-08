import { Cnab240BancoDoBrasilBoletoEmailField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-email-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BancoDoBrasilBoletoEmailSegmentoYField extends Cnab240BancoDoBrasilBoletoEmailField {
  readonly range: [number, number] = [20, 69]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, '03', '4')
  }
}
