import { CnabField400 } from '@/types/fields/cnab-field-400'
import { AlphanumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400NumeroDocumentoField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [110, 120]
  protected readonly description = 'Número do Documento'
  protected readonly validator = new AlphanumericValidator()
  protected readonly parser = new TrimParser()
}
