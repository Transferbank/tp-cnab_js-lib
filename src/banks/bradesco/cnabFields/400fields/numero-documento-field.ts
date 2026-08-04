import { CnabField400 } from '@/types/fields/cnab-field-400'

export class Bradesco400NumeroDocumentoField extends CnabField400<string> {
  protected readonly lineIndex = 1 // linha de detalhe
  protected readonly pos: [number, number] = [110, 120]
  protected readonly description = 'Número do Documento'

  validate(raw: string): void {
    if (raw.trim().length === 0) {
      this.throwError(raw, 'número do documento não pode estar vazio')
    }
  }

  parse(raw: string): string {
    return raw.trim()
  }
}
