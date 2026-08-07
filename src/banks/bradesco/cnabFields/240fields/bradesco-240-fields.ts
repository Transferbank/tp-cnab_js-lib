import { Bradesco240NossoNumeroField } from './segmentoP/nosso-numero-field'
import { Bradesco240NumeroDocumentoField } from './segmentoP/numero-documento-field'
import { Bradesco240VencimentoField } from './segmentoP/vencimento-field'
import { Bradesco240ValorField } from './segmentoP/valor-field'
import { Bradesco240DataEmissaoField } from './segmentoP/data-emissao-field'
import { Bradesco240DescontoValorField } from './segmentoP/desconto-valor-field'
import { Bradesco240AbatimentoValorField } from './segmentoP/abatimento-valor-field'
import { Bradesco240SacadoDocumentoField } from './segmentoQ/sacado-documento-field'
import { Bradesco240SacadoNomeField } from './segmentoQ/sacado-nome-field'
import { Bradesco240SacadoLogradouroField } from './segmentoQ/sacado-logradouro-field'
import { Bradesco240SacadoCepField } from './segmentoQ/sacado-cep-field'

export const bradesco240Fields = {
  nossoNumero: new Bradesco240NossoNumeroField(),
  numeroDocumento: new Bradesco240NumeroDocumentoField(),
  vencimento: new Bradesco240VencimentoField(),
  valor: new Bradesco240ValorField(),
  dataEmissao: new Bradesco240DataEmissaoField(),
  descontoValor: new Bradesco240DescontoValorField(),
  abatimentoValor: new Bradesco240AbatimentoValorField(),
  sacadoDocumento: new Bradesco240SacadoDocumentoField(),
  sacadoNome: new Bradesco240SacadoNomeField(),
  sacadoLogradouro: new Bradesco240SacadoLogradouroField(),
  sacadoCep: new Bradesco240SacadoCepField(),
}
