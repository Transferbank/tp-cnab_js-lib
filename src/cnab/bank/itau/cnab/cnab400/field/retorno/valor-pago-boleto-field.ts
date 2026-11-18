import { ValorPagoBoletoField as Cnab400ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { ITAU_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab400/ocorrencia-table'

const TARIFA_DE_COBRANCA_RANGE: [number, number] = [176, 188]

export class ValorPagoBoletoField extends Cnab400ValorPagoBoletoField {
  protected readonly addedRanges: Array<[number, number]> = [TARIFA_DE_COBRANCA_RANGE]
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = ITAU_CNAB400_OCORRENCIA_TABLE
}
