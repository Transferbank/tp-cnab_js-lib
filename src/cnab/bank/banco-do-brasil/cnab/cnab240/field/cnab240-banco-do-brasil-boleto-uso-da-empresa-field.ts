import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'

export class Cnab240BancoDoBrasilBoletoUsoDaEmpresaField extends Cnab240BoletoUsoDaEmpresaField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
}
