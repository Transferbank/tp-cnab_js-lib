import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeJurosBoletoField as Cnab240CodigoDeJurosBoletoField } from '@cnab/field/cnab240/codigo-de-juros-boleto-field'

export class CodigoDeJurosBoletoField extends Cnab240CodigoDeJurosBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
}
