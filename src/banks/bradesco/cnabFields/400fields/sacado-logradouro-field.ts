import { CnabField400 } from '@/types/fields/cnab-field-400'
import { OptionalValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoLogradouroField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [274, 314]
  protected readonly description = 'Endereço do Sacado'
  protected readonly validator = new OptionalValidator()
  protected readonly parser = new TrimParser()
}
