import { UsoDaEmpresaBoletoField as Cnab400UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/retorno/uso-da-empresa-boleto-field'

export class UsoDaEmpresaBoletoField extends Cnab400UsoDaEmpresaBoletoField {
  readonly range: [number, number] = [39, 63]
  protected readonly recordType: string = '7'
}
