import { CnabField } from '@/types/fields/cnab-field'
import { AlphanumericExtendedValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco240NumeroDocumentoField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [62, 77]
  protected readonly description = 'Número do Documento'
  protected readonly key = 'numeroDocumento'
  protected readonly validator = new AlphanumericExtendedValidator()
  protected readonly parser = new TrimParser()
}
