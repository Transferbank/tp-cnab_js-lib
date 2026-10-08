import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoEmailField } from '@cnab/field/cnab400/boleto-email-field'

export class Cnab400CaixaBoletoEmailField extends Cnab400BoletoEmailField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
