import { CnabField } from '@/types/fields/cnab-field'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco240CarteiraField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [37, 40]
  protected readonly description = 'Carteira'
  protected readonly key = 'carteira'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
