import { CnabBoleto240 } from '@/types/boleto/cnab-boleto-240'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { CnabField } from '@/types/fields/cnab-field'
import { CnabFieldValue } from '@/types/read/boleto-cnab-data'
import { Bradesco240CarteiraField } from '@/banks/bradesco/cnabFields/240fields/extraFields/carteira-field'
import {
  Bradesco240NossoNumeroField,
  Bradesco240NumeroDocumentoField,
  Bradesco240VencimentoField,
  Bradesco240ValorField,
  Bradesco240DataEmissaoField,
  Bradesco240DescontoValorField,
  Bradesco240AbatimentoValorField,
  Bradesco240SacadoDocumentoField,
  Bradesco240SacadoNomeField,
  Bradesco240SacadoLogradouroField,
  Bradesco240SacadoCepField,
} from '@/banks/bradesco/cnabFields/240fields/bradesco-240-fields'

export class BoletoBradesco240 extends CnabBoleto240 {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  private static readonly NOSSO_NUMERO_FIELD = new Bradesco240NossoNumeroField()
  protected get nossoNumeroField(): Bradesco240NossoNumeroField { return BoletoBradesco240.NOSSO_NUMERO_FIELD }

  private static readonly NUMERO_DOCUMENTO_FIELD = new Bradesco240NumeroDocumentoField()
  protected get numeroDocumentoField(): Bradesco240NumeroDocumentoField { return BoletoBradesco240.NUMERO_DOCUMENTO_FIELD }

  private static readonly VENCIMENTO_FIELD = new Bradesco240VencimentoField()
  protected get vencimentoField(): Bradesco240VencimentoField { return BoletoBradesco240.VENCIMENTO_FIELD }

  private static readonly VALOR_FIELD = new Bradesco240ValorField()
  protected get valorField(): Bradesco240ValorField { return BoletoBradesco240.VALOR_FIELD }

  private static readonly DATA_EMISSAO_FIELD = new Bradesco240DataEmissaoField()
  protected get dataEmissaoField(): Bradesco240DataEmissaoField { return BoletoBradesco240.DATA_EMISSAO_FIELD }

  private static readonly DESCONTO_VALOR_FIELD = new Bradesco240DescontoValorField()
  protected get descontoValorField(): Bradesco240DescontoValorField { return BoletoBradesco240.DESCONTO_VALOR_FIELD }

  private static readonly ABATIMENTO_VALOR_FIELD = new Bradesco240AbatimentoValorField()
  protected get abatimentoValorField(): Bradesco240AbatimentoValorField { return BoletoBradesco240.ABATIMENTO_VALOR_FIELD }

  private static readonly SACADO_DOCUMENTO_FIELD = new Bradesco240SacadoDocumentoField()
  protected get sacadoDocumentoField(): Bradesco240SacadoDocumentoField { return BoletoBradesco240.SACADO_DOCUMENTO_FIELD }

  private static readonly SACADO_NOME_FIELD = new Bradesco240SacadoNomeField()
  protected get sacadoNomeField(): Bradesco240SacadoNomeField { return BoletoBradesco240.SACADO_NOME_FIELD }

  private static readonly SACADO_LOGRADOURO_FIELD = new Bradesco240SacadoLogradouroField()
  protected get sacadoLogradouroField(): Bradesco240SacadoLogradouroField { return BoletoBradesco240.SACADO_LOGRADOURO_FIELD }

  private static readonly SACADO_CEP_FIELD = new Bradesco240SacadoCepField()
  protected get sacadoCepField(): Bradesco240SacadoCepField { return BoletoBradesco240.SACADO_CEP_FIELD }

  private static readonly EXTRA_FIELDS = [
    new Bradesco240CarteiraField(),
  ]
  protected get extraFields(): CnabField<CnabFieldValue>[] { return BoletoBradesco240.EXTRA_FIELDS }
}
