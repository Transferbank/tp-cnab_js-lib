import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240ItauGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }
}
