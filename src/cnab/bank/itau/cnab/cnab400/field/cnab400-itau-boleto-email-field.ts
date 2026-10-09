import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoEmailField } from '@cnab/field/cnab400/boleto-email-field'

export class Cnab400ItauBoletoEmailField extends Cnab400BoletoEmailField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '5'
  readonly range: [number, number] = [2, 121]
}
