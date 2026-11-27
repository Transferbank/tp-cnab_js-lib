export abstract class CnabBoletoGroupRule {
  abstract check(rawLine: string): boolean

  isOutsideBoleto(_rawLine: string): boolean {
    return false
  }
}
