import { NossoNumeroBoletoField } from '@cnab/field/cnab240/nosso-numero-boleto-field'

export class Cnab240CaixaBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [41, 57]
}
