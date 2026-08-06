import { CnabField } from '@/types/fields/cnab-field'
import { CustomValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class Bradesco400SacadoLogradouroField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [274, 314]
  protected readonly description = 'Endereço do Sacado'
  protected readonly key = 'sacadoLogradouro'
  protected readonly validator = new CustomValidator(
    (raw: string) => raw.trim().length > 0,
    'deve conter pelo menos um caractere não vazio'
  )
  protected readonly parser = new TrimParser()
}
