import { CnabField } from '@/types/fields/cnab-field'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400CarteiraCodigoField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [21, 24]
  protected readonly description = 'Código da Carteira'
  protected readonly key = 'carteiraCodigo'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}
