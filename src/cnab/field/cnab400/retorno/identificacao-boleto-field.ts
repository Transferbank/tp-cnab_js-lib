import { TextField } from '@cnab/field/cnab400/retorno/text-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class IdentificacaoBoletoField extends TextField {
  static readonly fieldType = CnabFieldType.BOLETO
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }
}
