import { ValorPagoBoletoField as Cnab400ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { ITAU_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab400/ocorrencia-table'

const TARIFA_DE_COBRANCA_RANGE: [number, number] = [176, 188]

// Sem confirmação do banco: o manual (2017, p.14) só descreve 254–266 como "valor lançado em conta corrente".
// A soma da tarifa e a leitura só na liquidação seguem o que foi observado em retornos do Itaú, numa amostra pequena.
// Fica assim até haver confirmação, porque sem o filtro a baixa seria lida com a tarifa como valor pago.
export class ValorPagoBoletoField extends Cnab400ValorPagoBoletoField {
  protected readonly addedRanges: Array<[number, number]> = [TARIFA_DE_COBRANCA_RANGE]
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = ITAU_CNAB400_OCORRENCIA_TABLE
}
