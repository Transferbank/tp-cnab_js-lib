import { CnabField400 } from '@/types/fields/cnab-field-400'
import { StringValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoNomeField extends CnabField400<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [234, 274]
  protected readonly description = 'Nome do Sacado'
  protected readonly validator = new StringValidator()
  protected readonly parser = new TrimParser()
}
