/**
 * Vocabulário de campos canônicos para mapeamento CNAB.
 * Espelha os caminhos dos campos em CNABData, CNABHeader e CNABTrailer.
 */
export type CanonicalField =
  // CNABData - campos de título
  | 'valor'
  | 'vencimento'
  | 'dataEmissao'
  | 'nossoNumero'
  | 'numeroDocumento'
  // CNABData - sacado
  | 'sacado.nome'
  | 'sacado.documento'
  | 'sacado.endereco.logradouro'
  | 'sacado.endereco.bairro'
  | 'sacado.endereco.cep'
  | 'sacado.endereco.cidade'
  | 'sacado.endereco.estado'
  // CNABData - multa
  | 'multa.tipo'
  | 'multa.valor'
  | 'multa.vigenciaAPartirDe'
  // CNABData - juros
  | 'juros.tipo'
  | 'juros.valor'
  | 'juros.vigenciaAPartirDe'
  // CNABData - desconto
  | 'desconto.valor'
  | 'desconto.dataLimite'
  // CNABData - abatimento
  | 'abatimento.valor'
  // CNABHeader
  | 'cedente.nome'
  | 'cedente.documento'
  | 'dataGeracao'
  // CNABTrailer (sem prefixo, mesmo padrão do header)
  | 'quantidadeRegistros'
  | 'quantidadeLotes'
  | 'valorTotal'
