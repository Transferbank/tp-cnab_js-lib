import { ValorPagoBoletoField as Cnab240ValorPagoBoletoField } from '@cnab/field/cnab240/retorno/valor-pago-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { SICOOB_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/sicoob/cnab/cnab240/ocorrencia-table'

// Sem confirmação do banco: a planilha do manual não trata o valor pago fora da liquidação.
// A leitura só na liquidação segue o que foi observado em retornos do Sicoob, em que a baixa por protesto repete o valor do título.
// Fica assim até haver confirmação, porque sem o filtro essa baixa seria lida como pagamento.
export class ValorPagoBoletoField extends Cnab240ValorPagoBoletoField {
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = SICOOB_CNAB240_OCORRENCIA_TABLE
}
