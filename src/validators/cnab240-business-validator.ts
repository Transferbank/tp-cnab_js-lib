/**
 * Validador CNAB 240
 */

import { extractLineFields } from '../parser/field-extractor'
import { BankSchema, CNABRecord, ValidationError } from '../types'
import { parseDate, isDateInPast, formatDateBR } from '../utils/date-parser'
import { validatePayerDocument } from '../utils/string-utils'

const LINE_LENGTH = 240

interface ValidationResult {  errors: ValidationError[],  records: CNABRecord[] }

/**
 * Valida um arquivo CNAB 240 já dividido em linhas e monta os registros de preview.
 *
 * Estrutura esperada (mínimo 4 linhas): Header de Arquivo, 1+ lotes (cada título é um
 * par de segmentos P + Q dentro de um lote tipo 3), Trailer de Arquivo. Este validador
 * não distingue lotes — percorre todas as linhas do meio em sequência e casa cada
 * Segmento P com o Segmento Q seguinte pela ordem de chegada (`detailCount`), assumindo
 * que o gerador do arquivo sempre intercala P e Q corretamente.
 *
 * Cada checagem de campo aqui só roda se `bankSchema` trouxer o respectivo schema
 * (`headerArquivo`/`segmentoP`/`segmentoQ`); quando ausente (banco não cadastrado em
 * `schemas/index.ts`), os erros campo-a-campo são pulados, mas a extração de
 * valor/vencimento/pagador ainda funciona via fallback de posição fixa (offsets do
 * layout FEBRABAN padrão), então `records` é preenchido mesmo sem schema.
 *
 * @param lines - linhas do arquivo já separadas por quebra de linha e sem linhas vazias
 *   (ver `fileContent.split(/\r?\n/).filter(...)` em `index.ts`) — os números de linha
 *   nos erros retornados (`ValidationError.line`) são posições **neste array**, não
 *   necessariamente da linha original do arquivo se houver diferença de quebras/linhas em branco
 * @param bankSchema - schema do banco detectado (`getBankSchema`), ou `null` se o banco
 *   não foi identificado/não está cadastrado
 * @returns lista de erros encontrados e os registros extraídos (um por Segmento Q válido)
 */
export function validateCnab240Business(lines: string[], bankSchema: BankSchema | null): ValidationResult {
  const errors: ValidationError[] = []
  const records: CNABRecord[] = []

  // Guard de segurança interna — return antecipado para evitar estouro de índice,
  // sem reportar erro (validador estrutural já cobre isso)
  if (lines.length < 4) {
    return { errors, records }
  }

  const headerSchema = bankSchema?.headerArquivo
  const segPSchema = bankSchema?.segmentoP
  const segQSchema = bankSchema?.segmentoQ

  // Validação do Header de Arquivo
  const header = lines[0]
  // Guard de segurança: skip validação se tamanho incorreto (estrutural já reporta isso)
  if (header.length === LINE_LENGTH && headerSchema) {
    const parsedHeader = extractLineFields(header, headerSchema)
    for (const [field, data] of Object.entries(parsedHeader)) {
      if (data.error) {
        errors.push({ line: 1, column: data.descricao as string || field, message: data.error })
      }
    }
  }

  // Validação dos Segmentos P + Q
  // Guarda valor/vencimento do Segmento P imediatamente anterior; válido apenas para o
  // próximo Q encontrado. Se qualquer outra linha aparecer entre P e Q (linha malformada,
  // header/trailer de lote, ou outro segmento), o pareamento é quebrado para evitar
  // acoplar dados de títulos diferentes.
  let pendingP: { amount: number; dueDate: string } | null = null

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    // Guard de segurança: skip linha com tamanho incorreto para não fatiar substring
    // fora do tamanho (estrutural já reporta o erro de tamanho)
    if (line.length !== LINE_LENGTH) {
      pendingP = null  // Linha ruim quebra qualquer pareamento pendente
      continue
    }

    // charAt(7) = posição 8 (1-indexed) = tipo de registro; só "3" (Detalhe) contém segmentos P/Q.
    if (line.charAt(7) !== '3') {
      pendingP = null  // Header/trailer de lote no meio também quebra o pareamento
      continue
    }
    // charAt(13) = posição 14 (1-indexed) = código do segmento dentro do registro de detalhe ('P' ou 'Q').
    const segment = line.charAt(13)

    // Segmento P
    if (segment === 'P') {
      const parsed = segPSchema ? extractLineFields(line, segPSchema) : null
      const fieldsWithError = new Set<string>()

      if (parsed) {
        for (const [field, data] of Object.entries(parsed)) {
          if (data.error) {
            errors.push({ line: lineNumber, column: data.descricao as string || field, message: data.error })
            fieldsWithError.add(field)
          }
        }
      }

      // Prioriza o campo nomeado do schema do banco (`valor_titulo`/`vencimento_titulo`);
      // se o schema não definir esse campo (ou não houver schema), cai no offset fixo do
      // layout FEBRABAN padrão de Segmento P (posições 86-100 e 78-85, 1-indexed).
      const amountRaw = parsed?.valor_titulo?.raw?.trim() || line.substring(85, 100).trim()
      const dueDateRaw = parsed?.vencimento_titulo?.raw?.trim() || line.substring(77, 85).trim()
      // decimais/formatoData também vêm do schema quando disponível; senão assume os
      // valores padrão do Segmento P FEBRABAN (2 casas decimais, data DDMMAAAA).
      const decimals = segPSchema?.valor_titulo?.decimals ?? 2
      const dateFormat = segPSchema?.vencimento_titulo?.dateFormat || 'DDMMAAAA'

      // Validar valor
      if (
        !fieldsWithError.has('valor_titulo') &&
        (!amountRaw || !/^\d+$/.test(amountRaw) || parseInt(amountRaw) <= 0)
      ) {
        errors.push({
          line: lineNumber,
          column: 'Valor da cobrança',
          message: 'Valor deve ser maior que R$ 0,00',
        })
      }

      // Validar data
      const dueDate = parseDate(dueDateRaw, dateFormat)
      if (!fieldsWithError.has('vencimento_titulo')) {
        if (!dueDate) {
          errors.push({
            line: lineNumber,
            column: 'Data de vencimento',
            message: 'Data de vencimento inválida',
          })
        } else if (isDateInPast(dueDate)) {
          errors.push({
            line: lineNumber,
            column: 'Data de vencimento',
            message: `Vencimento ${formatDateBR(dueDate)} é anterior à data atual`,
          })
        }
      }

      pendingP = {
        amount:
          amountRaw && /^\d+$/.test(amountRaw) ? parseInt(amountRaw) / Math.pow(10, decimals) : 0,
        dueDate: dueDate ? formatDateBR(dueDate) : '—',
      }
      continue  // Não cai no bloco de Q abaixo
    }

    // Segmento Q
    if (segment === 'Q') {
      if (!pendingP) {
        errors.push({
          line: lineNumber,
          column: 'Segmento Q',
          message: 'Segmento Q sem Segmento P válido correspondente — valor/vencimento indisponíveis',
        })
      }

      const parsed = segQSchema ? extractLineFields(line, segQSchema) : null
      const fieldsWithError = new Set<string>()

      if (parsed) {
        for (const [field, data] of Object.entries(parsed)) {
          if (data.error) {
            errors.push({ line: lineNumber, column: data.descricao as string || field, message: data.error })
            fieldsWithError.add(field)
          }
        }
      }

      // Mesmo padrão de fallback do Segmento P: prioriza o schema, senão usa o offset
      // fixo do Segmento Q FEBRABAN padrão (posições 19-33, 34-73, 74-113).
      const payerDocument = parsed?.sacado_inscricao_numero?.raw || line.substring(18, 33)
      const payerName = parsed?.sacado_nome?.value || line.substring(33, 73).trim()
      const payerAddress = parsed?.sacado_endereco?.value || line.substring(73, 113).trim()

      // Validar documento
      if (!fieldsWithError.has('sacado_inscricao_numero') && !validatePayerDocument(payerDocument)) {
        errors.push({
          line: lineNumber,
          column: 'CPF/CNPJ',
          message: 'Documento inválido ou incompleto',
        })
      }

      // Validar nome
      if (!fieldsWithError.has('sacado_nome') && (!payerName || (payerName as string).length < 3)) {
        errors.push({
          line: lineNumber,
          column: 'Nome do pagador',
          message: 'Nome do pagador é obrigatório',
        })
      }

      records.push({
        name: (payerName as string) || '—',
        amount: pendingP?.amount ?? 0,
        dueDate: pendingP?.dueDate ?? '—',
        address: (payerAddress as string) || '—',
        document: payerDocument.trim().replace(/^0+/, ''),
      })
      pendingP = null  // Consumido, não pode ser reaproveitado por um Q seguinte
      continue
    }

    // Segmento R/S/Y (ou qualquer coisa que não seja P/Q) entre um P pendente e seu Q
    // também invalida o pareamento — pela spec FEBRABAN, opcionais só vêm DEPOIS de um
    // par P+Q completo, nunca entre eles.
    pendingP = null
  }

  return { errors, records }
}
