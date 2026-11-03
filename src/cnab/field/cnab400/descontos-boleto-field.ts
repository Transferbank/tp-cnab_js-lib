import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabDescontosField } from '@cnab/field/cnab-descontos-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DescontosBoletoField extends CnabDescontosField {
  protected readonly descontos: CnabDescontoRanges[] = [
    { data: [174, 179], valor: [180, 192] }
  ]
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected parseDate(rawValue: string): Date | null {
    return parseDateDDMMAA(rawValue)
  }
}
