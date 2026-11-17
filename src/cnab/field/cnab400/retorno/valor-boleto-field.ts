import { ValorField } from '@cnab/field/cnab400/retorno/valor-field'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CodigoDeOcorrenciaBoletoField } from '@cnab/field/cnab400/retorno/codigo-de-ocorrencia-boleto-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabOcorrenciaTable, isLiquidacao } from '@cnab/type/cnab-ocorrencia'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class ValorBoletoField extends ValorField {
  static readonly fieldType = CnabFieldType.BOLETO
  protected readonly recordType: string = '1'
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable | null = null
  protected readonly ocorrenciaField: CnabFieldClass<string> = CodigoDeOcorrenciaBoletoField

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType) && this.isReadableOcorrencia()
  }

  private isReadableOcorrencia(): boolean {
    if (this.liquidacaoOnlyTable == null) {
      return true
    }
    const code = new this.ocorrenciaField(this.rawLine, this.lineNumber).value ?? ''
    return isLiquidacao(this.liquidacaoOnlyTable, code)
  }
}
