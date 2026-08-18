import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import {
  Cnab400LineTypeChecker,
  Cnab240LineTypeChecker
} from '@cnab/utils/line-type-checker'

export class Cnab400BradescoGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }
}

export class Cnab240BradescoGroupRule extends CnabBoletoGroupRule {
  check(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }
}