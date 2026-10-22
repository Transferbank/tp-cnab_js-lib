import { NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class Cnab400BradescoBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [71, 82]
}
