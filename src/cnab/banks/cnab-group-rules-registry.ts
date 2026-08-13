import { CnabBank } from '../types/cnab-bank-code'
import { CnabFormat } from '../types/cnab-format'
import { CnabBoletoGroupRule } from '../types/cnab-boleto-group-rule'
import { Cnab240BradescoGroupRule, Cnab400BradescoGroupRule } from './bradesco/group-rules'

type GroupRuleClass = typeof CnabBoletoGroupRule

export const CNAB_GROUP_RULES: Record<string, Record<string, GroupRuleClass>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: Cnab240BradescoGroupRule,
    [CnabFormat.CNAB400]: Cnab400BradescoGroupRule
  }
}

export function getGroupRule(bank: CnabBank, format: CnabFormat): GroupRuleClass {
  return CNAB_GROUP_RULES[bank]?.[format.toString()] ?? CnabBoletoGroupRule
}
