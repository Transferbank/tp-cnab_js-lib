import { CnabBoletoGroupRule } from '../../types/cnab-boleto-group-rule'

export class Cnab400BradescoGroupRule extends CnabBoletoGroupRule {
  static check(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }
}

export class Cnab240BradescoGroupRule extends CnabBoletoGroupRule {
  static check(rawLine: string): boolean {
    // Posição 7 (índice 7) é '3' E posição 14 (índice 13) é 'P'
    return rawLine[7] === '3' && rawLine[13] === 'P'
  }
}
