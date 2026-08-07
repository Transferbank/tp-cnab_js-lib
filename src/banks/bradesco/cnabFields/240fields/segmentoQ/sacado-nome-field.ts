import { CnabField } from '@/types/fields/cnab-field'
import { StringValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco240SacadoNomeField extends CnabField<string> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [33, 73]
  protected readonly description = 'Nome do Sacado'
  protected readonly key = 'sacadoNome'
  protected readonly validator = new StringValidator()
  protected readonly parser = new TrimParser()
}
