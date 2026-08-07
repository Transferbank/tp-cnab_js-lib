import { CnabField } from '@/types/fields/cnab-field'
import { DocumentValidator } from '@/types/fields/validators'
import { DocumentParser } from '@/types/fields/parsers'

export class Bradesco240SacadoDocumentoField extends CnabField<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [18, 33]
  protected readonly description = 'Documento do Sacado'
  protected readonly key = 'sacadoDocumento'
  protected readonly validator = new DocumentValidator()
  protected readonly parser = new DocumentParser()
}
