import { Cnab400BoletoNossoNumeroField } from '@cnab/field/cnab400/boleto-nosso-numero-field'

export class Cnab400BancoDoBrasilBoletoNossoNumeroField extends Cnab400BoletoNossoNumeroField {
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [64, 80]
}
