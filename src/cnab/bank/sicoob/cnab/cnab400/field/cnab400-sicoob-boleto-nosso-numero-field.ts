import { Cnab400BoletoNossoNumeroField } from '@cnab/field/cnab400/boleto-nosso-numero-field'

export class Cnab400SicoobBoletoNossoNumeroField extends Cnab400BoletoNossoNumeroField {
  readonly range: [number, number] = [63, 74]
}
