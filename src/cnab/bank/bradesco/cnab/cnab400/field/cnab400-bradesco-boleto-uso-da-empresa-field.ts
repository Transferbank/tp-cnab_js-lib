import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoUsoDaEmpresaField } from '@cnab/field/cnab400/boleto-uso-da-empresa-field'

export class Cnab400BradescoBoletoUsoDaEmpresaField extends Cnab400BoletoUsoDaEmpresaField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB400
}
