import { Cnab240BoletoNossoNumeroField } from '@cnab/field/cnab240/boleto-nosso-numero-field'

export class Cnab240CaixaBoletoNossoNumeroField extends Cnab240BoletoNossoNumeroField {
  readonly range: [number, number] = [41, 57]
}
