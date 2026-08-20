import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'

export class Cnab400BradescoGroupRule extends CnabBoletoGroupRule {
  static check(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }
}