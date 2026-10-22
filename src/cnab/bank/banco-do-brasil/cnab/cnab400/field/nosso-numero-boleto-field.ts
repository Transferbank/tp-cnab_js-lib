import { NossoNumeroBoletoField as Cnab400NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class NossoNumeroBoletoField extends Cnab400NossoNumeroBoletoField {
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [64, 80]
}
