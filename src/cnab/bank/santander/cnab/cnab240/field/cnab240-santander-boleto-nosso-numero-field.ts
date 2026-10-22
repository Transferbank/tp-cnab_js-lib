import { Cnab240BoletoNossoNumeroField } from '@cnab/field/cnab240/boleto-nosso-numero-field'

export class Cnab240SantanderBoletoNossoNumeroField extends Cnab240BoletoNossoNumeroField {
  readonly range: [number, number] = [45, 57]
}
