import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DddBoletoField as Cnab240DddBoletoField } from '@cnab/field/cnab240/ddd-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DddBoletoField extends Cnab240DddBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, this.optionalRecordCode, '4')
  }
}
