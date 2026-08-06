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
  protected readonly nossoNumeroField = new Bradesco400NossoNumeroField()
  protected readonly numeroDocumentoField = new Bradesco400NumeroDocumentoField()
  protected readonly vencimentoField = new Bradesco400VencimentoField()
  protected readonly valorField = new Bradesco400ValorField()
  protected readonly dataEmissaoField = new Bradesco400DataEmissaoField()
  protected readonly descontoValorField = new Bradesco400DescontoValorField()
  protected readonly abatimentoValorField = new Bradesco400AbatimentoValorField()
  protected readonly sacadoDocumentoField = new Bradesco400SacadoDocumentoField()
  protected readonly sacadoNomeField = new Bradesco400SacadoNomeField()
  protected readonly sacadoLogradouroField = new Bradesco400SacadoLogradouroField()
  protected readonly sacadoCepField = new Bradesco400SacadoCepField()

  protected readonly extraFields = [
    new Bradesco400CodigoOcorrenciaField(),
    new Bradesco400CarteiraCodigoField(),
  ]

  constructor(rawContent: string[]) {
    super(rawContent)
  }
}
