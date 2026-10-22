import { NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class Cnab400SicoobBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [63, 74]
}
