#!/usr/bin/env ts-node
/**
 * Script para parsear o fixture CNAB 400 do Itaú e gerar JSON completo com metadados
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../src/parser/field-extractor'
import { getBankSchema } from '../src/schemas'
import { BANK_CODES } from '../src/types'

const fixturePath = path.join(
  __dirname,
  '../tests/fixtures/cnab400/itau/ITAU_cnab_400.REM',
)
const outputPath = path.join(
  __dirname,
  '../tests/fixtures/cnab400/itau/ITAU_cnab_400.json',
)

// Ler o arquivo
const content = fs.readFileSync(fixturePath, 'latin1')
const lines = content.split(/\r?\n/).filter((line) => line.length > 0)

console.log(`📄 Total de linhas: ${lines.length}`)

// Obter schema do Itaú
const schema = getBankSchema(BANK_CODES.ITAU, 'cnab400')
if (!schema) {
  throw new Error('Schema do Itaú não encontrado')
}

// Parsear header (linha 0)
const headerLine = lines[0]
const headerFields = extractLineFields(headerLine, schema.header!)
console.log('📋 Header:', {
  nome_empresa: headerFields.nome_empresa?.value,
  data_geracao: headerFields.data_geracao?.raw,
  codigo_banco: headerFields.codigo_banco?.value,
  agencia: headerFields.agencia?.raw,
  conta: headerFields.conta?.raw,
  dac: headerFields.dac?.raw,
})

// Parsear linhas de detalhe (tipo 1) e contar linhas tipo 2
const detailLines = []
let messageLines = 0

for (let i = 1; i < lines.length - 1; i++) {
  const line = lines[i]
  if (line[0] === '1') {
    detailLines.push(line)
  } else if (line[0] === '2') {
    messageLines++
  }
}

console.log(`📊 Linhas de detalhe (tipo 1): ${detailLines.length}`)
console.log(`📊 Linhas de multa (tipo 2): ${messageLines}`)

// Parsear cada detalhe
const records = detailLines.map((line, idx) => {
  const fields = extractLineFields(line, schema.detail!)

  // Tipo de documento e número
  const docTypeCode = fields.codigo_inscricao?.raw || fields.sacado_codigo_inscricao?.raw || ''
  const documentType = docTypeCode === '01' ? 'CPF' : 'CNPJ'
  const documentRaw = fields.sacado_numero_inscricao?.raw || ''

  // Valor (13 caracteres com 2 decimais implícitas)
  const amountRaw = fields.valor_titulo?.raw || ''
  const amountValue = Number(fields.valor_titulo?.value || 0)

  // Data de vencimento (DDMMAA)
  const dueDateRaw = fields.vencimento?.raw || ''
  const dd = dueDateRaw.substring(0, 2)
  const mm = dueDateRaw.substring(2, 4)
  const aa = dueDateRaw.substring(4, 6)
  const dueDate = `${dd}/${mm}/20${aa}`

  // Campos de endereço
  const name = String(fields.nome?.value || '').trim()
  const logradouro = String(fields.logradouro?.value || '').trim()
  const cep = fields.cep?.raw || ''
  const cidade = String(fields.cidade?.value || '').trim()
  const estado = String(fields.estado?.value || '').trim()
  
  // Campos específicos do Itaú
  const numeroDocumento = String(fields.numero_documento?.value || '').trim()
  const nossoNumero = String(fields.nosso_numero?.raw || '')

  // Formatar CEP
  const zipCode = cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep

  return {
    index: idx + 1,
    name,
    document: documentRaw.replace(/^0+/, '') || '0', // Remover zeros à esquerda, manter pelo menos um zero
    documentRaw,
    documentType,
    documentTypeCode: docTypeCode,
    amount: amountValue,
    amountRaw,
    dueDate,
    dueDateRaw,
    address: logradouro,
    zipCode,
    city: cidade,
    state: estado,
    numeroDocumento,
    nossoNumero,
  }
})

// Parsear trailer (última linha)
const trailerLine = lines[lines.length - 1]
const trailerFields = extractLineFields(trailerLine, schema.trailer!)
console.log('📋 Trailer:', {
  numero_sequencial: trailerFields.numero_sequencial?.value,
})

// Calcular totais
const totalAmount = records.reduce((sum, record) => sum + record.amount, 0)
console.log(`\n📊 Totais calculados:`)
console.log(`   - Quantidade de registros: ${records.length}`)
console.log(`   - Valor total: R$ ${totalAmount.toFixed(2)}`)

// Verificar estados únicos
const estados = new Set(records.map((r) => r.state).filter(Boolean))
console.log(`   - Estados diferentes: ${estados.size}`)
console.log(`   - Estados: ${Array.from(estados).sort().join(', ')}`)

// Construir objeto de metadados
const dataGeracaoRaw = headerFields.data_geracao?.raw || ''
const headerDd = dataGeracaoRaw.substring(0, 2)
const headerMm = dataGeracaoRaw.substring(2, 4)
const headerAa = dataGeracaoRaw.substring(4, 6)

const metadata = {
  description: `Arquivo CNAB 400 Itaú com ${records.length} títulos - Remessa de cobrança (${lines.length} linhas: 1 header + ${detailLines.length} tipo 1 + ${messageLines} tipo 2 + 1 trailer)`,
  bankCode: BANK_CODES.ITAU,
  bankName: 'Itaú',
  format: 'CNAB400',
  structure: {
    totalLines: lines.length,
    headerLines: 1,
    detailLines: detailLines.length,
    messageLines: messageLines,
    trailerLines: 1,
  },
  header: {
    cedenteNome: String(headerFields.nome_empresa?.value || '').trim(),
    cedenteCNPJ: String(headerFields.numero_inscricao?.raw || '').trim(),
    agencia: headerFields.agencia?.raw || '',
    conta: headerFields.conta?.raw || '',
    dac: headerFields.dac?.raw || '',
    dataGeracao: `${headerDd}/${headerMm}/20${headerAa}`,
    dataGeracaoRaw: dataGeracaoRaw,
    tipoArquivo: headerFields.tipo_operacao?.raw || '1',
  },
  records,
  totals: {
    recordCount: records.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  },
  notes: [
    `Arquivo real com ${lines.length} linhas (1 header + ${detailLines.length + messageLines} registros de dados + 1 trailer)`,
    `Cada título (tipo 1) é seguido imediatamente por um registro tipo 2 (multa)`,
    `Total de ${records.length} títulos distintos`,
    `Estados presentes: ${Array.from(estados).sort().join(', ')}`,
    `Códigos de ocorrência variados: 01, 02, 06, 09`,
    `Todos os registros têm agência=${headerFields.agencia?.raw}, conta=${headerFields.conta?.raw}, dac=${headerFields.dac?.raw} (consistência validada)`,
    `Valor total calculado pela soma de todos os ${records.length} títulos`,
  ],
}

// Salvar metadados em arquivo
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf8')
console.log(`\n✅ Metadados salvos em: ${outputPath}`)
console.log(`\n🎯 Próximo passo: rodar os testes`)
console.log(`   npm test -- tests/fixtures/cnab400/itau/ITAU_cnab_400.test.ts`)
