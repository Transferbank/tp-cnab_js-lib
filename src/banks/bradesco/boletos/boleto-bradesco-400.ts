import { CnabBoleto400 } from '@/types/boleto/cnab-boleto-400'
import {
  Bradesco400NossoNumeroField,
  Bradesco400NumeroDocumentoField,
  Bradesco400VencimentoField,
  Bradesco400ValorField,
  Bradesco400DataEmissaoField,
  Bradesco400DescontoValorField,
  Bradesco400AbatimentoValorField,
  Bradesco400SacadoDocumentoField,
  Bradesco400SacadoNomeField,
  Bradesco400SacadoLogradouroField,
  Bradesco400SacadoCepField,
} from '@/banks/bradesco/cnabFields/400fields/bradesco-400-fields'
import {
  Bradesco400CodigoOcorrenciaField,
  Bradesco400CarteiraCodigoField,
} from '@banks/bradesco/cnabFields/400fields/extraFields/bradesco-400-extra-fields'
import { BANK_CODES } from '@/types/bank/bank-types'

export class BoletoBradesco400 extends CnabBoleto400 {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  private static readonly NOSSO_NUMERO_FIELD = new Bradesco400NossoNumeroField()
  protected get nossoNumeroField() { return BoletoBradesco400.NOSSO_NUMERO_FIELD }

  private static readonly NUMERO_DOCUMENTO_FIELD = new Bradesco400NumeroDocumentoField()
  protected get numeroDocumentoField() { return BoletoBradesco400.NUMERO_DOCUMENTO_FIELD }

  private static readonly VENCIMENTO_FIELD = new Bradesco400VencimentoField()
  protected get vencimentoField() { return BoletoBradesco400.VENCIMENTO_FIELD }

  private static readonly VALOR_FIELD = new Bradesco400ValorField()
  protected get valorField() { return BoletoBradesco400.VALOR_FIELD }

  private static readonly DATA_EMISSAO_FIELD = new Bradesco400DataEmissaoField()
  protected get dataEmissaoField() { return BoletoBradesco400.DATA_EMISSAO_FIELD }

  private static readonly DESCONTO_VALOR_FIELD = new Bradesco400DescontoValorField()
  protected get descontoValorField() { return BoletoBradesco400.DESCONTO_VALOR_FIELD }

  private static readonly ABATIMENTO_VALOR_FIELD = new Bradesco400AbatimentoValorField()
  protected get abatimentoValorField() { return BoletoBradesco400.ABATIMENTO_VALOR_FIELD }

  private static readonly SACADO_DOCUMENTO_FIELD = new Bradesco400SacadoDocumentoField()
  protected get sacadoDocumentoField() { return BoletoBradesco400.SACADO_DOCUMENTO_FIELD }

  private static readonly SACADO_NOME_FIELD = new Bradesco400SacadoNomeField()
  protected get sacadoNomeField() { return BoletoBradesco400.SACADO_NOME_FIELD }

  private static readonly SACADO_LOGRADOURO_FIELD = new Bradesco400SacadoLogradouroField()
  protected get sacadoLogradouroField() { return BoletoBradesco400.SACADO_LOGRADOURO_FIELD }

  private static readonly SACADO_CEP_FIELD = new Bradesco400SacadoCepField()
  protected get sacadoCepField() { return BoletoBradesco400.SACADO_CEP_FIELD }

  private static readonly EXTRA_FIELDS = [
    new Bradesco400CodigoOcorrenciaField(),
    new Bradesco400CarteiraCodigoField(),
  ]
  protected get extraFields() { return BoletoBradesco400.EXTRA_FIELDS }

  constructor(rawContent: string[]) {
    super(rawContent)
  }
}
