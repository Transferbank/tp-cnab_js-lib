import { NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'

export class Cnab400CaixaBoletoNossoNumeroField extends NossoNumeroBoletoField {
  readonly range: [number, number] = [57, 73]
}
