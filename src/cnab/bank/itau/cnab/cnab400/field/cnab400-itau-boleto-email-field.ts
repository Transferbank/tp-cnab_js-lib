import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoEmailField } from '@cnab/field/cnab400/boleto-email-field'

// No Itaú CNAB400, o e-mail do pagador fica no registro 5 
// (opcional, enviado logo depois do registro 1 do boleto)
export class Cnab400ItauBoletoEmailField extends Cnab400BoletoEmailField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '5'
  readonly range: [number, number] = [2, 121]
}
