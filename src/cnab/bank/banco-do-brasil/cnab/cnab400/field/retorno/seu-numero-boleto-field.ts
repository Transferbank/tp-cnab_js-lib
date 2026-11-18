import { SeuNumeroBoletoField as Cnab400SeuNumeroBoletoField } from '@cnab/field/cnab400/retorno/seu-numero-boleto-field'

export class SeuNumeroBoletoField extends Cnab400SeuNumeroBoletoField {
  protected readonly recordType: string = '7'
}
