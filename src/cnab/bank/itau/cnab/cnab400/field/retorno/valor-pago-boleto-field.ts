import { ValorPagoBoletoField as Cnab400ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { ITAU_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab400/ocorrencia-table'

export class ValorPagoBoletoField extends Cnab400ValorPagoBoletoField {
  protected readonly addedRanges: Array<[number, number]> = [
    [176, 188] // tarifa de cobrança
  ]
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = ITAU_CNAB400_OCORRENCIA_TABLE
}
