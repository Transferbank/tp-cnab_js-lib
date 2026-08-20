export abstract class CnabBoletoGroupRule {
  static check(_rawLine: string): boolean {
    throw new Error('Subclass must implement static method check()')
  }
}