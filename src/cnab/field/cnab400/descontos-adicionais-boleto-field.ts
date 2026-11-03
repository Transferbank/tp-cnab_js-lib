import { CnabDescontosField } from '@cnab/field/cnab-descontos-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class DescontosAdicionaisBoletoField extends CnabDescontosField {
  protected abstract readonly recordType: string

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected parseDate(rawValue: string): Date | null {
    return parseDateDDMMAA(rawValue)
  }
}
