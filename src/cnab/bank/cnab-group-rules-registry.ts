import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
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
