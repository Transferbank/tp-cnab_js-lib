export abstract class CnabBoletoGroupRule {
  abstract check(rawLine: string): boolean
}