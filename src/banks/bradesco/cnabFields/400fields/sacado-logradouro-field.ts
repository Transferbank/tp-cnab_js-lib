import { CnabField } from '@/types/fields/cnab-field'
import { OptionalValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoLogradouroField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [274, 314]
  protected readonly description = 'Endereço do Sacado'
  protected readonly validator = new OptionalValidator()
  protected readonly parser = new TrimParser()
}
