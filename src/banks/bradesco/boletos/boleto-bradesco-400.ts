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
} from '@banks/bradesco/cnabFields/bradesco-400-fields'

export class BoletoBradesco400 extends CnabBoleto400 {
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

  constructor(rawContent: string[]) {
    super(rawContent)
  }
}
