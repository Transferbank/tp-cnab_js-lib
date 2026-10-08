import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'

export class Cnab240BradescoBoletoEmailField extends Cnab240BoletoEmailField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
