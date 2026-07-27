/**
 * Tipos para schemas de banco
 */

import type { CanonicalField } from '../read'
import type { ParsedLine } from '../core'

/**
 * Tipo de dado do campo, controla como `field-extractor.ts` converte o valor bruto:
 * - `'num'`  → vira `number` (dígitos são somados/convertidos; ver `decimais`).
 * - `'alfa'` → vira `string` com `trimEnd()` (mantém espaços à esquerda, remove à direita).
 * - `'data'` → permanece `string` (apenas `trim()`); a conversão para `Date` é feita à parte, via `parseDate`/`formatoData`.
 */
export type FieldType = 'num' | 'alfa' | 'data'
/** Formato de data esperado quando `tipo === 'data'`. `null` quando o campo não é uma data. Usado por `parseDate` (`utils/date-parser.ts`). */
export type DateFormat = 'DDMMAA' | 'DDMMAAAA' | 'AAAAMMDD' | null

/** Definição de UM campo dentro de um registro (header/detail/trailer/segmento) de um banco. */
export interface FieldDefinition {
  /**
   * Posição inicial e final do campo na linha, **1-indexada e inclusiva** (como nos manuais FEBRABAN),
   * ex: `[1, 3]` = primeiros 3 caracteres. `field-extractor.ts` converte isso para o `substring`
   * 0-indexado do JavaScript (`start - 1` até `end`).
   */
  pos: [number, number]
  type: FieldType
  /** Tamanho em caracteres do campo. Deve bater com `pos[1] - pos[0] + 1` — não é validado automaticamente, é responsabilidade de quem escreve o schema. */
  size: number
  /**
   * Quantidade de casas decimais implícitas, só relevante quando `tipo === 'num'`.
   * O CNAB não usa ponto decimal: um campo com `decimais: 2` e valor bruto `"000015000"`
   * vira `150.00` (divide o inteiro por 10^decimais). `0` para campos numéricos inteiros.
   */
  decimals: number
  /**
   * Se `true`, o campo não pode ficar em branco (ver `checkFieldFormat`).
   * Atenção: quando combinado com `padrao`, o valor fixo esperado só é de fato
   * conferido se `obrigatorio` for `true` — um `padrao` num campo opcional é
   * só documentação, não é validado.
   */
  required: boolean
  dateFormat: DateFormat
  /**
   * Valor literal fixo esperado para o campo (ex: código do banco, "REMESSA", tipo de registro).
   * Só é efetivamente checado contra o valor da linha quando `obrigatorio: true` (ver nota acima).
   */
  pattern: string | number | null
  /** Rótulo legível do campo, usado como `column` nas mensagens de erro (`ValidationError.column`). */
  description: string
  /**
   * Mapping to canonical field in structured read API.
   * 
   * - string: direct mapping (e.g., 'valor', 'sacado.nome')
   * - object: mapping with custom interpretation
   * - null: field not yet mapped or has no canonical equivalent
   * 
   * Required field (not optional) to force explicit mapping decision.
   */
  canonical:
    | CanonicalField
    | {
        field: CanonicalField
        interpret: (rawValue: unknown, line: ParsedLine) => unknown
      }
    | null
}

/**
 * Layout de um tipo de registro (ex: só o header, ou só o segmento P), mapeando
 * nome do campo → definição.
 *
 * Contrato importante e não-óbvio: os *nomes* das chaves usados aqui (ex: `valor_titulo`,
 * `vencimento`, `nome`, `sacado_numero_inscricao`) são lidos por nome direto pelos
 * validadores (`cnab240-business-validator.ts`/`cnab400-business-validator.ts`) para montar o `CNABRecord`
 * de preview (valor, vencimento, nome do pagador, documento). Se um schema de banco usar
 * um nome diferente para o mesmo campo semântico, o validador não vai encontrá-lo por
 * essa chave e cai no fallback de posição fixa hard-coded (`line.substring(...)`) escrito
 * para o layout FEBRABAN padrão — o que pode estar errado para bancos com layout próprio.
 */
export interface RecordSchema {
  [fieldName: string]: FieldDefinition
}

/**
 * Define um registro opcional (não obrigatório na estrutura do arquivo).
 * 
 * Registros opcionais podem ou não aparecer no arquivo dependendo das necessidades
 * do boleto/título. Exemplos: multa, descontos adicionais, mensagens, PIX, etc.
 */
export interface OptionalRecordSchema {
  /**
   * Chave usada para casar uma linha do arquivo com este registro opcional.
   * 
   * CNAB 400: dígito de tipo_registro (posição 1), ex: '2', '5'. Quando o mesmo
   *   dígito tem mais de uma variante (mesmo tipo_registro, conteúdo diferente
   *   conforme um segundo campo), a chave é composta: '<tipo_registro>-<sufixo>',
   *   ex: '5-99' (BB, tipo_registro=5 + tipo_servico=99), '6-1' (Itaú, tipo_registro=6
   *   + codigo_layout=1).
   * 
   * CNAB 240: letra do segmento (posição 14), ex: 'R', 'S'. Para o segmento Y, que
   *   tem sub-variantes, a chave é 'Y' + os 2 dígitos da posição 18-19, ex: 'Y01', 'Y03'.
   */
  identifier: string
  
  /**
   * Schema do registro opcional (layout completo dos campos).
   */
  schema: RecordSchema
}

/**
 * Schema completo de um banco. Os campos usados dependem do formato:
 * CNAB 400 usa `header`/`detail`/`trailer`; CNAB 240 usa `headerArquivo`/`headerLote`/
 * `segmentoP`/`segmentoQ`/`trailerArquivo`. Um banco que suporta
 * os dois formatos (ex: Santander) teria ambos os conjuntos preenchidos em objetos
 * `BankSchema` distintos (ver `schemas/index.ts`).
 * Todos os campos são opcionais: se um bloco não tiver schema definido, os validadores
 * pulam a checagem campo-a-campo daquele bloco e usam apenas os fallbacks de posição fixa.
 * 
 * Segmentos CNAB 240:
 * - P e Q: usados em remessa (envio de títulos ao banco) - obrigatórios
 * - Registros opcionais (R, S, Y*): definidos em `optionalRecords`
 * 
 * Nota: Segmentos T e U existem no padrão FEBRABAN mas são usados apenas em arquivos
 * de retorno (resposta do banco). Não foram implementados pois o foco do projeto é
 * parsing de arquivos de remessa.
 */
export interface BankSchema {
  bankCode: string
  bankName: string
  // CNAB 400
  header?: RecordSchema
  detail?: RecordSchema
  trailer?: RecordSchema
  // CNAB 240 - Remessa
  headerArquivo?: RecordSchema
  headerLote?: RecordSchema
  segmentoP?: RecordSchema
  segmentoQ?: RecordSchema
  trailerLote?: RecordSchema
  trailerArquivo?: RecordSchema
  /**
   * Registros opcionais (não obrigatórios) suportados por este banco.
   * 
   * CNAB 240: Segmentos opcionais como R (descontos/multa), S (mensagens), Y* (PIX/e-mail/etc)
   * CNAB 400: Registros opcionais como tipo 2 (mensagens), tipo 5 (multa/descontos), etc
   * 
   * Cada registro é identificado por sua chave única (`identifier`) que permite ao
   * validador estrutural reconhecer o registro quando ele aparecer no arquivo.
   */
  optionalRecords?: OptionalRecordSchema[]
}

/** Tabela de schemas indexada pelo código FEBRABAN do banco (ex: `'237'` → Bradesco). Ver `cnab240Banks`/`cnab400Banks` em `schemas/index.ts`. */
export interface BankSchemaRegistry {
  [bankCode: string]: BankSchema
}
