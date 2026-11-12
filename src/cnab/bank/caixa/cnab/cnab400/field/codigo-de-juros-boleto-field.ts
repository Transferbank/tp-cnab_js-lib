import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeJurosBoletoField as Cnab400CodigoDeJurosBoletoField } from '@cnab/field/cnab400/codigo-de-juros-boleto-field'

export class CodigoDeJurosBoletoField extends Cnab400CodigoDeJurosBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
