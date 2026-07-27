/**
 * Tipos principais para processamento CNAB
 */

/** Rótulo amigável para exibição (ex: em UI). Não usar para comparações de lógica — use `CNABFormatCode`. */
export type CNABFormat = 'CNAB 240' | 'CNAB 400'
/** Código interno do formato, usado em toda a lógica de detecção/roteamento (`format === 'cnab400'`). */
export type CNABFormatCode = 'cnab240' | 'cnab400'

/** Identificação do banco emissor/recebedor do arquivo. */
export interface BankInfo {
  /** Código FEBRABAN do banco (ex: "237" para Bradesco), sempre como string — pode ter zeros à esquerda. */
  code: string
  /** Nome do banco. Se o código não estiver cadastrado em `schemas/index.ts`, vem como "Banco {code}" (ver `index.ts`). */
  name: string
}

/**
 * Registro de cobrança "achatado" para exibição/preview (ex: tabela em UI).
 *
 * Importante: os valores aqui já vêm formatados/normalizados e NÃO são os mesmos
 * tipos que aparecem em `ParsedField`/`ParsedLine`:
 * - `amount` já é o valor decimal final (ex: 150.00), não o inteiro bruto do CNAB.
 * - `dueDate` já é uma string formatada `DD/MM/AAAA` (ver `formatDateBR`), não um `Date`.
 * - `document` já vem sem zeros à esquerda (CPF/CNPJ "puro").
 * Quando um campo não pôde ser extraído (schema ausente ou erro de validação),
 * os validadores preenchem com `'—'` (traço) ou `0`, nunca deixam `undefined`.
 */
export interface CNABRecord {
  name: string
  amount: number
  dueDate: string
  address: string
  document: string
}

/** Um problema encontrado ao validar uma linha/campo do arquivo. */
export interface ValidationError {
  /** Número da linha dentro do array de linhas já processado (ver aviso em `index.ts` sobre numeração). 1-indexado. */
  line: number
  /** Nome legível do campo/seção onde o erro ocorreu — normalmente `fieldDef.descricao`, ou um rótulo fixo como "Estrutura"/"Tamanho do registro" quando o problema não é de um campo específico. */
  column: string
  message: string
}

/** Resultado agregado de `validateCnabFile` — o retorno público principal da lib. */
export interface CNABValidationResult {
  /** `true` somente se `errors` estiver vazio. Um arquivo pode ser "reconhecido" (formato/banco detectados) e ainda assim ser inválido. */
  valid: boolean
  format: CNABFormat | null
  /** `null` quando o formato não foi detectado, ou quando o header não trouxe um código de banco reconhecível. */
  bank: BankInfo | null
  totalRecords: number
  records: CNABRecord[]
  errors: ValidationError[]
}

/**
 * Resultado da extração de UM campo de uma linha, feita por `extractLineFields`.
 *
 * Atenção: além de `raw`/`value`/`error`/`canonico`, o objeto também contém — espalhadas (spread) —
 * todas as propriedades da `FieldDefinition` original do schema (`pos`, `tipo`, `tamanho`,
 * `obrigatorio`, `formatoData`, `padrao`, `descricao`). Isso é o que permite fazer
 * `parsedField.descricao` ou `parsedField.tipo` diretamente, mas também significa que o
 * tipo real em runtime é mais amplo do que só estes campos — daí o índice `[key: string]: unknown`.
 */
export interface ParsedField {
  /** Valor exatamente como aparece no arquivo, na largura da posição (`pos`), sem nenhuma conversão de tipo. Ainda pode conter espaços em branco à direita/esquerda. */
  raw: string
  /** Valor já convertido conforme `fieldDef.tipo`: `number` para campos `'num'`, `string` (com trim) para `'alfa'`/`'data'`. Para `'data'` continua sendo texto — a conversão para `Date` é feita à parte via `parseDate`. */
  value: string | number
  /** Descrição do problema de formato/preenchimento, ou `null` se o campo passou em todas as checagens de `checkFieldFormat`. */
  error: string | null
  /** Mapeamento para campo canônico, herdado da FieldDefinition. Permite extração de dados estruturados sem cast. */
  canonical: import('../bank').FieldDefinition['canonical']
  [key: string]: unknown
}

/** Todos os campos de UMA linha CNAB já extraídos, indexados pelo nome do campo (mesma chave usada no `RecordSchema`). */
export interface ParsedLine {
  [fieldName: string]: ParsedField
}

/**
 * Resultado da validação de um CNABFile através do método validate().
 * 
 * Diferente de CNABValidationResult (usado por validateCnabFile), este tipo
 * é retornado pelo método CNABFile.validate() e já assume que tipo e banco
 * foram detectados previamente em openCnab().
 */
export interface CNABFileValidationResult {
  /** true se não houver erros de validação */
  isValid: boolean
  feedback: {
    /** Formato do arquivo (sempre presente pois CNABFile já foi detectado) */
    type: CNABFormat
    /** Nome do banco (sempre presente pois CNABFile já foi detectado) */
    bank: string
    /** Lista de erros encontrados na validação, vazia se isValid = true */
    lines: ValidationError[]
  }
}
