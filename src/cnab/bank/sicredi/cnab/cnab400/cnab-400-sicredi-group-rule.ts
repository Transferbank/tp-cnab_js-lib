import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'

export class Cnab400SicrediGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }
}
