import { Cnab240BancoDoBrasilBoletoEmailListField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-email-list-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BancoDoBrasilBoletoEmailSegmentoSField extends Cnab240BancoDoBrasilBoletoEmailListField {
  readonly range: [number, number] = [21, 160]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoS(this.rawLine, '8')
  }
}
