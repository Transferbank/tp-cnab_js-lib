import { CnabField400 } from '@/types/fields/cnab-field-400'
import { validatePayerDocument } from '@utils/string-utils'

export class Bradesco400SacadoDocumentoField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [220, 234]
  protected readonly description = 'CPF/CNPJ do Sacado'

  validate(raw: string): void {
    if (!validatePayerDocument(raw)) {
      this.throwError(raw, 'CPF ou CNPJ inválido')
    }
  }

  parse(raw: string): string {
    return raw.trim().replace(/^0+/, '')
  }
}
