import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeMultaBoletoField as Cnab400CodigoDeMultaBoletoField } from '@cnab/field/cnab400/codigo-de-multa-boleto-field'

export class CodigoDeMultaBoletoField extends Cnab400CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [2, 2]
  protected readonly recordType: string = '2'
  protected readonly zeroIsAbsent: boolean = false
}
