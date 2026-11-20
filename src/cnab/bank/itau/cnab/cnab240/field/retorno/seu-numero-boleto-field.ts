import { SeuNumeroBoletoField as Cnab240SeuNumeroBoletoField } from '@cnab/field/cnab240/retorno/seu-numero-boleto-field'

export class SeuNumeroBoletoField extends Cnab240SeuNumeroBoletoField {
  readonly range: [number, number] = [59, 68]
}
