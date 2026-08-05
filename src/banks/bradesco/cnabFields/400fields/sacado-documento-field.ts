import { CnabField } from '@/types/fields/cnab-field'
import { DocumentValidator } from '@/types/fields/validators'
import { DocumentParser } from '@/types/fields/parsers'

export class Bradesco400SacadoDocumentoField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [220, 234]
  protected readonly description = 'CPF/CNPJ do Sacado'
  protected readonly validator = new DocumentValidator()
  protected readonly parser = new DocumentParser()
}
