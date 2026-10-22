import { NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class Cnab400BancoDoBrasilBoletoNossoNumeroField extends NossoNumeroBoletoField {
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [64, 80]
}
