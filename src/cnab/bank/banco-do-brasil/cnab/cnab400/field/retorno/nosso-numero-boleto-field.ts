import { NossoNumeroBoletoField as Cnab400NossoNumeroBoletoField } from '@cnab/field/cnab400/retorno/nosso-numero-boleto-field'

export class NossoNumeroBoletoField extends Cnab400NossoNumeroBoletoField {
  readonly range: [number, number] = [64, 80]
  protected readonly recordType: string = '7'
}
