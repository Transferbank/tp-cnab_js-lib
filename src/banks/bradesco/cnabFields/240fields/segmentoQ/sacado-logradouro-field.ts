import { CnabField } from '@/types/fields/cnab-field'
import { OptionalValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco240SacadoLogradouroField extends CnabField<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [73, 113]
  protected readonly description = 'Logradouro do Sacado'
  protected readonly key = 'sacadoLogradouro'
  protected readonly validator = new OptionalValidator()
  protected readonly parser = new TrimParser()
}
