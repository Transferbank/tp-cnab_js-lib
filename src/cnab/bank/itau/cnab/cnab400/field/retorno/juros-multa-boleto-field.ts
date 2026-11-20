import { JurosMultaBoletoField as Cnab400JurosMultaBoletoField } from '@cnab/field/cnab400/retorno/juros-multa-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { ITAU_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab400/ocorrencia-table'

// Sem confirmação do banco: o manual (2017, p.14) só descreve 267–279 como "JUROS DE MORA/MULTA — VALOR DE MORA E MULTA", sem nota.
// A leitura só na liquidação segue o que foi observado em retornos do Itaú, em que a entrada já traz essa posição preenchida.
// Fica assim até haver confirmação, porque sem o filtro a entrada seria lida como juros pagos.
export class JurosMultaBoletoField extends Cnab400JurosMultaBoletoField {
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = ITAU_CNAB400_OCORRENCIA_TABLE
}
