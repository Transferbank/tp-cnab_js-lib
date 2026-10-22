import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { EmailBoletoField } from '@cnab/field/cnab400/email-boleto-field'

export class Cnab400ItauBoletoEmailField extends EmailBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '5'
  readonly range: [number, number] = [2, 121]
}
