import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabTableCodeField } from '@cnab/field/cnab-table-code-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { getJurosCodes } from '@cnab/bank/cnab-tipo-de-juros-tables'
import { blankIfZeros } from '@cnab/utils/phone-parser'

export class CodigoDeJurosBoletoField extends CnabTableCodeField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'codigo_de_juros'
  readonly range: [number, number] = [77, 77]
  protected readonly codeLabel = 'código de juros'
  protected readonly zeroIsAbsent: boolean = true
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return this.zeroIsAbsent ? blankIfZeros(rawValue) : rawValue
  }

  protected getTableCodes(bank: CnabBank, format: CnabFormat): Record<string, unknown> | undefined {
    return getJurosCodes(bank, format)
  }
}
