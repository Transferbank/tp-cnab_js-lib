import { Cnab240BancoDoBrasilBoletoEmailField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-email-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// No Banco do Brasil CNAB240, o segmento Y-04 usa o tipo de registro '4' na posição 8,
//  e não o '3' do padrão FEBRABAN.
export class Cnab240BancoDoBrasilBoletoEmailSegmentoYField extends Cnab240BancoDoBrasilBoletoEmailField {
  readonly range: [number, number] = [20, 69]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, '03', '4')
  }
}
