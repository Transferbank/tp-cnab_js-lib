/**
 * Validador CNAB 400
 */

import { extractLineFields } from '../parser/field-extractor'
import { getRecordTypePattern } from '../parser/field-extractor'
import { BankSchema, CNABRecord, ValidationError, BANK_CODES } from '../types'
import { parseDate, isDateInPast, formatDateBR } from '../utils/date-parser'
import { validatePayerDocument } from '../utils/string-utils'

const LINE_LENGTH = 400

interface ValidationResult {
  errors: ValidationError[]
  records: CNABRecord[]
}

/**
 * Valida um arquivo CNAB 400 já dividido em linhas e monta os registros de preview.
 *
 * Estrutura esperada (mínimo 3 linhas): Header, 1+ registros de Detalhe, Trailer.
 * Diferente do CNAB 240, cada linha de detalhe já contém sozinha todos os dados de um
 * título (não há segmentos separados) — por isso não há necessidade de "casar" registros
 * como no validador 240.
 *
 * Assim como no CNAB 240, as checagens campo-a-campo só rodam se `bankSchema` trouxer o
 * schema correspondente (`header`/`detail`/`trailer`); na ausência de schema, a extração
 * de valor/vencimento/pagador ainda funciona via fallback de offset fixo do layout
 * FEBRABAN padrão.
 *
 * @param lines - linhas do arquivo já separadas por quebra de linha e sem linhas vazias
 *   (ver `index.ts`) — números de linha nos erros são posições **neste array**
 * @param bankSchema - schema do banco detectado, ou `null` se não identificado/cadastrado
 * @returns lista de erros e os registros extraídos (um por linha de Detalhe válida)
 */
export function validateCnab400Business(lines: string[], bankSchema: BankSchema | null): ValidationResult {
  const errors: ValidationError[] = []
  const records: CNABRecord[] = []
  
  // Guard de segurança interna — return antecipado para evitar estouro de índice,
  // sem reportar erro (validador estrutural já cobre isso)
  if (lines.length < 3) {
    return { errors, records }
  }

  const headerSchema = bankSchema?.header
  const detailSchema = bankSchema?.detail

  // Tipo de registro do header (posição 1, 1-indexed — charAt(0)). Lido pela posição do
  // campo no schema (getRecordTypePattern), não pelo nome, porque bancos nomeiam esse
  // campo diferente (tipo_registro, codigo_registro...).
  const headerType = String(getRecordTypePattern(headerSchema, 1) ?? '0')

  // Tipo de registro do detalhe (posição 1, 1-indexed — charAt(0)). A maioria dos bancos
  // usa '1', mas o Banco do Brasil usa '7' (ver `schemas/banks/bancoDoBrasil/cnab400.ts`);
  // por isso lê do schema em vez de assumir um valor fixo.
  // Lê pela posição, não pelo nome do campo (varia: tipo_registro, codigo_registro...)
  const detailRecordType = String(getRecordTypePattern(detailSchema, 1) ?? '1')

  // Validação do Header
  const header = lines[0]
  // Guard de segurança: skip validação se tamanho incorreto (estrutural já reporta isso)
  if (header.length === LINE_LENGTH) {
    if (header.charAt(0) !== String(headerType)) {
      errors.push({
        line: 1,
        column: 'Header',
        message: `Primeira linha deve ser registro Header (tipo ${headerType})`,
      })
    }
    if (headerSchema) {
      const parsedHeader = extractLineFields(header, headerSchema)
      for (const [field, data] of Object.entries(parsedHeader)) {
        // O campo de tipo de registro (mesma posição de headerType) já foi
        // validado explicitamente acima com a coluna 'Header', consistente com o
        // validador estrutural — pular aqui evita reportar o mesmo problema duas
        // vezes com coluna/mensagem diferentes.
        if ((data.pos as [number, number] | undefined)?.[0] === 1) continue
        if (data.error) {
          errors.push({ line: 1, column: data.descricao as string || field, message: data.error })
        }
      }
    }
  }

  // Validação dos registros de Detalhe
  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    // Guard de segurança: skip linha com tamanho incorreto para não fatiar substring
    // fora do tamanho (estrutural já reporta o erro de tamanho)
    if (line.length !== LINE_LENGTH) {
      continue
    }

    if (line.charAt(0) !== String(detailRecordType)) continue

    const parsed = detailSchema ? extractLineFields(line, detailSchema) : null
    const fieldsWithError = new Set<string>()

    if (parsed) {
      for (const [field, data] of Object.entries(parsed)) {
        if (data.error) {
          errors.push({ line: lineNumber, column: data.descricao as string || field, message: data.error })
          fieldsWithError.add(field)
        }
      }
    }

    // Extrair valores — prioriza o campo nomeado do schema do banco; se ausente, cai no
    // offset fixo do layout FEBRABAN padrão de Detalhe do CNAB 400 (posições 1-indexed:
    // 235-274 nome, 221-234 documento, 275-314 endereço, 127-139 valor, 121-126 vencimento).
    const payerName = parsed?.nome?.value || line.substring(234, 274).trim()
    const payerDocument = parsed?.sacado_numero_inscricao?.raw || line.substring(220, 234)
    const payerAddress = parsed?.logradouro?.value || line.substring(274, 314).trim()
    const amountRaw = parsed?.valor_titulo?.raw?.trim() || line.substring(126, 139).trim()
    const dueDateRaw = parsed?.vencimento?.raw?.trim() || line.substring(120, 126).trim()

    // decimais/formatoData também vêm do schema quando disponível; senão assume os
    // valores padrão do CNAB 400 (2 casas decimais, data DDMMAA — ano com 2 dígitos).
    const decimals = detailSchema?.valor_titulo?.decimals ?? 2
    const dateFormat = detailSchema?.vencimento?.dateFormat || 'DDMMAA'

    // Validar nome
    if (!fieldsWithError.has('nome') && (!payerName || (payerName as string).length < 3)) {
      errors.push({
        line: lineNumber,
        column: 'Nome do pagador',
        message: 'Nome do pagador é obrigatório',
      })
    }

    // Validar documento
    if (!fieldsWithError.has('sacado_numero_inscricao') && !validatePayerDocument(payerDocument)) {
      errors.push({
        line: lineNumber,
        column: 'CPF/CNPJ',
        message: 'Documento inválido ou incompleto',
      })
    }

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

    // Validar data — '888888'/'999999' são literais especiais EXCLUSIVOS do Sicoob
    // ("à vista"/"contra apresentação", ver schemas/banks/sicoob/cnab400/detail.ts) e
    // não representam uma data real, então não devem ser parseados nem comparados com
    // a data atual. Restrito a bankSchema.bankCode === Sicoob: em qualquer outro banco,
    // esses valores literais em `vencimento` devem continuar sendo tratados como data
    // inválida (ver nota sobre o Banco do Brasil abaixo).
    const isSicoob = bankSchema?.bankCode === BANK_CODES.SICOOB
    const isSpecialDueDate = isSicoob && (dueDateRaw === '888888' || dueDateRaw === '999999')
    const dueDate = isSpecialDueDate ? null : parseDate(dueDateRaw, dateFormat)
    if (!fieldsWithError.has('vencimento') && !isSpecialDueDate) {
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

    // Montar registro para preview
    const amountValue =
      amountRaw && /^\d+$/.test(amountRaw) ? parseInt(amountRaw) / Math.pow(10, decimals) : 0
    records.push({
      name: (payerName as string) || '—',
      amount: amountValue,
      dueDate: dueDate ? formatDateBR(dueDate) : '—',
      address: (payerAddress as string) || '—',
      document: payerDocument.trim().replace(/^0+/, ''),
    })
  }

  return { errors, records }
}
