/**
 * Script to parse the Santander CNAB400 fixture and generate metadata JSON
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../src/parser/field-extractor'
import { santanderCnab400 } from '../src/schemas/banks/santander/cnab400'

const fixturePath = path.join(
  __dirname,
  '../tests/fixtures/cnab400/santander/SANTANDER_cnab_400.REM',
)
const outputPath = path.join(
  __dirname,
  '../tests/fixtures/cnab400/santander/remessa-multipla.json',
)

// Read the fixture file
const content = fs.readFileSync(fixturePath, 'latin1')
const lines = content.split(/\r?\n/).filter((line) => line.length > 0)

console.log(`Total lines: ${lines.length}`)

// Parse header (line 1)
const headerLine = lines[0]
const headerFields = extractLineFields(headerLine, santanderCnab400.header!)
console.log('Header:', {
  nome_empresa: headerFields.nome_empresa?.value,
  data_geracao: headerFields.data_geracao?.raw,
  codigo_banco: headerFields.codigo_banco?.value,
})

// Parse detail lines (lines 2 to n-1, tipo_registro = '1')
const detailLines = lines.filter(
  (line, idx) => idx > 0 && idx < lines.length - 1 && line[0] === '1',
)
console.log(`Detail lines: ${detailLines.length}`)

const records = detailLines.map((line, idx) => {
  const fields = extractLineFields(line, santanderCnab400.detail!)

  // Parse document type and number
  const docTypeCode = fields.sacado_codigo_inscricao?.raw || ''
  const docTypeCodeNum = parseInt(docTypeCode, 10)
  const documentType = docTypeCodeNum === 1 ? 'CPF' : 'CNPJ'
  const documentRaw = fields.sacado_numero_inscricao?.raw || ''

  // Parse amount (13 chars with 2 decimal places implicit)
  const amountRaw = line.substring(126, 139) // pos 127-139
  const amountValue = parseInt(amountRaw, 10) / 100

  // Parse due date
  const dueDateRaw = line.substring(120, 126) // pos 121-126 (DDMMAA)
  const dd = dueDateRaw.substring(0, 2)
  const mm = dueDateRaw.substring(2, 4)
  const aa = dueDateRaw.substring(4, 6)
  const dueDate = `${dd}/${mm}/20${aa}`

  // Parse address fields
  const name = String(fields.nome?.value || '').trim()
  const logradouro = String(fields.logradouro?.value || '').trim()
  const bairro = String(fields.bairro?.value || '').trim()
  const cep = fields.cep?.raw || ''
  const cidade = String(fields.cidade?.value || '').trim()
  const estado = String(fields.estado?.value || '').trim()

  return {
    index: idx + 1,
    name,
    document: documentRaw,
    documentRaw,
    documentType,
    documentTypeCode: docTypeCode.padStart(2, '0'),
    amount: amountValue,
    amountRaw,
    dueDate,
    dueDateRaw,
    address: logradouro,
    bairro,
    cep,
    cidade,
    estado,
    numeroDocumento: fields.numero_documento?.value || '',
  }
})

// Parse trailer (last line)
const trailerLine = lines[lines.length - 1]
const trailerFields = extractLineFields(trailerLine, santanderCnab400.trailer!)
console.log('Trailer:', {
  qtd_documentos: trailerFields.qtd_documentos?.value,
  valor_total: trailerFields.valor_total?.value,
})

// Calculate totals
const totalAmount = records.reduce((sum, record) => sum + record.amount, 0)
console.log(`\nCalculated totals:`)
console.log(`  Record count: ${records.length}`)
console.log(`  Total amount: ${totalAmount.toFixed(2)}`)
console.log(`\nTrailer verification:`)
console.log(
  `  qtd_documentos matches: ${trailerFields.qtd_documentos?.value === records.length}`,
)
const trailerValorTotal = Number(trailerFields.valor_total?.value || 0)
console.log(
  `  valor_total matches: ${Math.abs(trailerValorTotal - totalAmount) < 0.01}`,
)

// Build metadata object
const metadata = {
  description: 'Arquivo de remessa CNAB400 Santander com múltiplos títulos',
  bankCode: '033',
  bankName: 'Santander',
  format: 'CNAB400',
  structure: {
    totalLines: lines.length,
    headerLines: 1,
    detailLines: detailLines.length,
    trailerLines: 1,
  },
  header: {
    cedenteNome: String(headerFields.nome_empresa?.value || '').trim(),
    dataGeracao: headerFields.data_geracao?.value || '',
    dataGeracaoRaw: headerFields.data_geracao?.raw || '',
    tipoOperacao: headerFields.tipo_operacao?.raw || '1',
  },
  records,
  totals: {
    recordCount: records.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  },
}

// Write metadata to file
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf8')
console.log(`\nMetadata written to: ${outputPath}`)
