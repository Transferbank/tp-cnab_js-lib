import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoCelularField } from '@cnab/field/cnab240/boleto-celular-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BancoDoBrasilBoletoCelularField extends Cnab240BoletoCelularField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  readonly range: [number, number] = [72, 79]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, this.optionalRecordCode, '4')
  }
}
