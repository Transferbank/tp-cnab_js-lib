import { Cnab400BoletoNossoNumeroField } from '@cnab/field/cnab400/boleto-nosso-numero-field'

export class Cnab400CaixaBoletoNossoNumeroField extends Cnab400BoletoNossoNumeroField {
  readonly range: [number, number] = [57, 73]
}
