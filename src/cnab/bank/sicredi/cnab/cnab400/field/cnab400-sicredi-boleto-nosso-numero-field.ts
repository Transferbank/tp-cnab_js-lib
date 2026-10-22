import { NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class Cnab400SicrediBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [48, 56]
}
