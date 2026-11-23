import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabTableCodeField } from '@cnab/field/cnab-table-code-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { getMultaCodes } from '@cnab/bank/cnab-tipo-de-multa-tables'
import { blankIfZeros } from '@cnab/utils/phone-parser'

export class CodigoDeMultaBoletoField extends CnabTableCodeField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'codigo_de_multa'
  readonly range: [number, number] = [66, 66]
  protected readonly codeLabel = 'código de multa'
  protected readonly zeroIsAbsent: boolean = true

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoR(this.rawLine)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return this.zeroIsAbsent ? blankIfZeros(rawValue) : rawValue
  }

  protected getTableCodes(bank: CnabBank, format: CnabFormat): Record<string, unknown> | undefined {
    return getMultaCodes(bank, format)
  }
}
