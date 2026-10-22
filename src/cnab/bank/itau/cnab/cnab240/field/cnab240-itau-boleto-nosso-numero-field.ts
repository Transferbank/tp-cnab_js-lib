import { NossoNumeroBoletoField } from '@cnab/field/cnab240/nosso-numero-boleto-field'

export class Cnab240ItauBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [38, 49]
}
