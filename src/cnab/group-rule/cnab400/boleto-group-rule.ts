import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BoletoGroupRule extends CnabBoletoGroupRule {
  private readonly recordType: string

  constructor(recordType: string = '1') {
    super()
    this.recordType = recordType
  }

  check(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine, this.recordType)
  }
}
