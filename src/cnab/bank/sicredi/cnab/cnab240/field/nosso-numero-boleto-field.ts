import { NossoNumeroBoletoField } from '@cnab/field/cnab240/nosso-numero-boleto-field'

export class Cnab240SicrediBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [38, 46]
}
