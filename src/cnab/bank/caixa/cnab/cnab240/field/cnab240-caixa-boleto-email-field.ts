import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'

// Na Caixa CNAB240, o segmento Y-04 usa o código de registro opcional '04', 
// e não o '03' do padrão FEBRABAN.
export class Cnab240CaixaBoletoEmailField extends Cnab240BoletoEmailField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
  protected readonly optionalRecordCode: string = '04'
}
