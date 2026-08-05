import { CnabField } from '@/types/fields/cnab-field'
import { StringValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoNomeField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [234, 274]
  protected readonly description = 'Nome do Sacado'
  protected readonly validator = new StringValidator()
  protected readonly parser = new TrimParser()
}
