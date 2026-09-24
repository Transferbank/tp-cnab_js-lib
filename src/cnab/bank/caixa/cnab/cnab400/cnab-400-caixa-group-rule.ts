import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400CaixaGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }
}
