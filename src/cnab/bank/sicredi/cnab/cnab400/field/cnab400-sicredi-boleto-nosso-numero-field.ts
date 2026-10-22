import * as Cnab400 from '@cnab/field/cnab400/fields'

export class Cnab400SicrediBoletoNossoNumeroField extends Cnab400.NossoNumeroBoletoField {
  readonly range: [number, number] = [48, 56]
}
