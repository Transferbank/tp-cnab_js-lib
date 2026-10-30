import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeMultaBoletoField as Cnab400CodigoDeMultaBoletoField } from '@cnab/field/cnab400/codigo-de-multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class CodigoDeMultaBoletoField extends Cnab400CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [4, 4]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }
}
