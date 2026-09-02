import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'

export class Cnab400BancoDoBrasilGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return rawLine.startsWith('7')
  }
}