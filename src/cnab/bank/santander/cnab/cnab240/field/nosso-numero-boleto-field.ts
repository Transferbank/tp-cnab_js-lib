import { NossoNumeroBoletoField } from '@cnab/field/cnab240/nosso-numero-boleto-field'

export class Cnab240SantanderBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [45, 57]
}
