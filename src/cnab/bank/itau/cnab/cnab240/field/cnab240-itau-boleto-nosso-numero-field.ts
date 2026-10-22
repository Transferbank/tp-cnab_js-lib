import * as Cnab240 from '@cnab/field/cnab240/fields'

export class Cnab240ItauBoletoNossoNumeroField extends Cnab240.NossoNumeroBoletoField {
  readonly range: [number, number] = [38, 49]
}
