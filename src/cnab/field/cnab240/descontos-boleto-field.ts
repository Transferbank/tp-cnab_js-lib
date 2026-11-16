import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabDescontosField } from '@cnab/field/cnab-descontos-field'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DescontosBoletoField extends CnabDescontosField {
  protected readonly descontos: CnabDescontoRanges[] = [
    { codigo: [142, 142], data: [143, 150], valor: [151, 165] }
  ]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected parseDate(rawValue: string): Date | null {
    return parseDateDDMMAAAA(rawValue)
  }
}
