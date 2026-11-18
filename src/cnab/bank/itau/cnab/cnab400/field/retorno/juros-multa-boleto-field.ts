import { JurosMultaBoletoField as Cnab400JurosMultaBoletoField } from '@cnab/field/cnab400/retorno/juros-multa-boleto-field'
import { CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { ITAU_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab400/ocorrencia-table'

export class JurosMultaBoletoField extends Cnab400JurosMultaBoletoField {
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable = ITAU_CNAB400_OCORRENCIA_TABLE
}
