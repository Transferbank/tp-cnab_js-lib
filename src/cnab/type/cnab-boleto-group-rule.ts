export abstract class CnabBoletoGroupRule {
  static check(_rawLine: string): boolean {
    throw new Error(`${this.name}.check() must be implemented by subclass`)
  }
}