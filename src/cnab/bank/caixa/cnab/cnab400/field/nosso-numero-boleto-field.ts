import { NossoNumeroBoletoField as Cnab400NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class NossoNumeroBoletoField extends Cnab400NossoNumeroBoletoField {
  readonly range: [number, number] = [57, 73]
}
