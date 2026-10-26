import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [93, 96]
  protected readonly valorRange: [number, number] = [97, 108]

  protected extractRawValue(): string {
    if (this.extractRangeFromLine(19, 20) != 'A') return super.extractRawValue()
    return blankIfZeros(this.extractRangeFromLine(this.valorRange[0] - 1, this.valorRange[1]))
  }
}
