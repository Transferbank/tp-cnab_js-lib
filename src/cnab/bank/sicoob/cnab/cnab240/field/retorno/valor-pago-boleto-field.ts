import { ValorPagoBoletoField as Cnab240ValorPagoBoletoField } from '@cnab/field/cnab240/retorno/valor-pago-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { SICOOB_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/sicoob/cnab/cnab240/ocorrencia-table'

export class ValorPagoBoletoField extends Cnab240ValorPagoBoletoField {
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = SICOOB_CNAB240_OCORRENCIA_TABLE
}
