import * as Cnab240 from '@cnab/field/cnab240/fields'

export class Cnab240SantanderBoletoNossoNumeroField extends Cnab240.NossoNumeroBoletoField {
  readonly range: [number, number] = [45, 57]
}
