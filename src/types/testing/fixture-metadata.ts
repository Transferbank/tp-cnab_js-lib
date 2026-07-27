/**
 * Types para o sistema de metadados de fixtures CNAB
 * 
 * Este módulo define as estruturas de dados para metadados JSON que documentam
 * e validam arquivos fixture CNAB de teste.
 * 
 * O sistema é genérico e funciona para:
 * - Qualquer banco (Bradesco, Santander, Itaú, Caixa, etc)
 * - CNAB 240 e CNAB 400
 * - Qualquer tipo de arquivo (remessa, retorno, múltiplos lotes)
 */

/**
 * Formato do arquivo CNAB
 */
export type CnabFormat = 'CNAB240' | 'CNAB400'

/**
 * Tipo de documento do pagador/sacado
 */
export type DocumentType = 'CPF' | 'CNPJ'

/**
 * Metadados completos de um arquivo fixture CNAB
 * 
 * @example
 * ```typescript
 * const metadata: FixtureMetadata = {
 *   description: "Remessa CNAB 240 Bradesco com 3 títulos de teste",
 *   bankCode: "237",
 *   bankName: "Bradesco",
 *   format: "CNAB240",
 *   structure: {
 *     totalLines: 8,
 *     headerLines: 1,
 *     detailLines: 6,
 *     trailerLines: 1
 *   },
 *   records: [
 *     {
 *       index: 0,
 *       name: "JOAO DA SILVA",
 *       document: "11144477735",
 *       documentType: "CPF",
 *       amount: 100.00,
 *       dueDate: "15/12/2026"
 *     }
 *   ],
 *   totals: {
 *     recordCount: 1,
 *     totalAmount: 100.00
 *   }
 * }
 * ```
 */
export interface FixtureMetadata {
  /** Descrição textual do propósito deste fixture */
  description: string

  /** Código do banco (3 dígitos) - Ex: "237" para Bradesco */
  bankCode: string

  /** Nome do banco para legibilidade - Ex: "Bradesco" */
  bankName: string

  /** Formato do arquivo CNAB */
  format: CnabFormat

  /** Estrutura geral do arquivo (contadores de linhas) */
  structure: FixtureStructure

  /** Dados do header do arquivo (opcional para validações específicas) */
  header?: FixtureHeader

  /** Lista de títulos/registros contidos no arquivo */
  records: FixtureRecord[]

  /** Totalizadores calculados (redundância para validação) */
  totals: FixtureTotals
}

/**
 * Estrutura de linhas do arquivo
 * 
 * Para CNAB 240: totalLines = headerLines + detailLines + trailerLines
 * Para CNAB 400: estrutura similar mas com formato diferente
 */
export interface FixtureStructure {
  /** Total de linhas no arquivo */
  totalLines: number

  /** Número de linhas de header (geralmente 1) */
  headerLines: number

  /** Número de linhas de detalhe (títulos) */
  detailLines: number

  /** Número de linhas de trailer (geralmente 1) */
  trailerLines: number

  /** Número de lotes (CNAB 240 pode ter múltiplos lotes) */
  batchCount?: number

  /**
   * Número de linhas de mensagem (tipo '2') — específico do CNAB 400, onde cada
   * título de detalhe (tipo '1') pode ser seguido de uma linha de mensagem livre.
   * Opcional porque nem todo fixture/formato tem esse tipo de linha (ex: CNAB 240).
   */
  messageLines?: number
}

/**
 * Dados do header de arquivo (opcional)
 * 
 * Útil para validar parsing correto do header
 */
export interface FixtureHeader {
  /** Nome do cedente/empresa */
  cedenteNome?: string

  /** Data de geração do arquivo (formato DD/MM/AAAA) */
  dataGeracao?: string

  /** Data de geração em formato raw CNAB (DDMMAAAA) */
  dataGeracaoRaw?: string

  /** Código de remessa ("1") ou retorno ("2") */
  tipoArquivo?: string

  /** Código do cliente/cedente na cooperativa — usado por bancos que não separam agência+conta (ex: Sicredi) */
  codigoCliente?: string

  /** CPF/CNPJ do cedente, quando presente no header (ex: Sicredi) */
  numeroInscricaoCedente?: string

  /** Número sequencial da remessa (controle do cliente), quando distinto do numero_sequencial do registro (ex: Sicredi) */
  sequencialRemessa?: string

  /** Versão do sistema/layout, quando o banco grava esse literal no header (ex: Sicredi, "2.00") */
  versaoSistema?: string
}

/**
 * Representa um título/registro no arquivo CNAB
 * 
 * Contém os dados principais que os testes validam, incluindo
 * versões formatadas e raw (CNAB) para cobertura completa de testes.
 */
export interface FixtureRecord {
  /** Índice sequencial do registro (0-based) */
  index: number

  /** Nome do pagador/sacado */
  name: string

  /** CPF ou CNPJ do pagador (apenas números, sem formatação) */
  document: string

  /** CPF ou CNPJ em formato raw CNAB (com padding de zeros à esquerda) */
  documentRaw?: string

  /** Tipo do documento */
  documentType: DocumentType

  /** Tipo de inscrição em código CNAB ("1" para CPF, "2" para CNPJ) */
  documentTypeCode?: string

  /** Valor do título em reais (com centavos) */
  amount: number

  /** Valor do título em formato raw CNAB (inteiro com padding de zeros) */
  amountRaw?: string

  /** Data de vencimento (formato DD/MM/AAAA) */
  dueDate: string

  /** Data de vencimento em formato raw CNAB (DDMMAAAA) */
  dueDateRaw?: string

  /** Endereço completo (opcional) */
  address?: string

  /** Cidade (opcional) */
  city?: string

  /** Estado/UF (opcional) */
  state?: string

  /** CEP formatado com hífen (opcional) */
  zipCode?: string

  /** Nosso número ou identificador único do título (opcional) */
  ourNumber?: string

  /** Nosso número, no nome de campo que os scripts de geração de metadata realmente usam (ver nota abaixo) */
  nossoNumero?: string

  /** "Seu número"/número do documento na empresa, quando exposto separadamente do campo raw (ex: Sicredi, BB) */
  numeroDocumento?: string

  /** Código de instrução/ocorrência do registro, quando o banco expõe esse campo (ex: Sicredi) */
  instrucao?: string

  /** Código de espécie do título, quando o banco expõe esse campo (ex: Sicredi) */
  especie?: string
}

/**
 * Totalizadores para validação de integridade
 * 
 * Permite validar que soma dos valores e quantidade de registros
 * batem com o esperado
 */
export interface FixtureTotals {
  /** Quantidade de registros/títulos */
  recordCount: number

  /** Soma total dos valores (em reais) */
  totalAmount: number
}
