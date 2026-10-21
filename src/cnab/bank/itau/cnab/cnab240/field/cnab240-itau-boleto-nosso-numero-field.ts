import { Cnab240BoletoNossoNumeroField } from '@cnab/field/cnab240/boleto-nosso-numero-field'

export class Cnab240ItauBoletoNossoNumeroField extends Cnab240BoletoNossoNumeroField {
  readonly range: [number, number] = [38, 49]
}
