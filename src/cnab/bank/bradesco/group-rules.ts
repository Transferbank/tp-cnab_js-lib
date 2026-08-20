import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'

export class Cnab400BradescoGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }
}

export class Cnab240BradescoGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    // Posição 8 (índice 7) é '3' E posição 14 (índice 13) é 'P'
    return rawLine[7] === '3' && rawLine[13] === 'P'
  }
}