import * as Cnab400 from '@cnab/field/cnab400/fields'

export class Cnab400BancoDoBrasilBoletoNossoNumeroField extends Cnab400.NossoNumeroBoletoField {
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [64, 80]
}
