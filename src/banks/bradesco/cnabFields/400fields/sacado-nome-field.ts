import { CnabField400 } from '@/types/fields/cnab-field-400'

export class Bradesco400SacadoNomeField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [234, 274]
  protected readonly description = 'Nome do Sacado'

  validate(raw: string): void {
    if (raw.trim().length === 0) {
      this.throwError(raw, 'nome do sacado não pode estar vazio')
    }
  }

  parse(raw: string): string {
    return raw.trim()
  }
}
