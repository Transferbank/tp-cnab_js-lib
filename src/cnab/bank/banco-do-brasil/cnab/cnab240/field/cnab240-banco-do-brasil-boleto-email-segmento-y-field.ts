import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// No Banco do Brasil CNAB240, o segmento Y-04 usa o tipo de registro '4' na posição 8,
//  e não o '3' do padrão FEBRABAN.
export class Cnab240BancoDoBrasilBoletoEmailSegmentoYField extends Cnab240BoletoEmailField {
  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, this.optionalRecordCode, '4')
  }
}
