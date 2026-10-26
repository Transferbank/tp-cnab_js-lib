import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeMultaBoletoField as Cnab240CodigoDeMultaBoletoField } from '@cnab/field/cnab240/codigo-de-multa-boleto-field'

export class CodigoDeMultaBoletoField extends Cnab240CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB240
}
