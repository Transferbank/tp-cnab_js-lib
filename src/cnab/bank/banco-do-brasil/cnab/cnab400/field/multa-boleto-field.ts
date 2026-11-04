import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [11, 22]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }
}
