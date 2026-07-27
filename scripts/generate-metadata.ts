#!/usr/bin/env ts-node

/**
 * Script CLI para gerar arquivo JSON de metadados a partir de arquivo TXT CNAB
 * 
 * Uso:
 *   npm run generate-metadata
 *   
 * Ou diretamente:
 *   npm run generate-metadata -- --bank=bradesco --format=CNAB400 --fixture=remessa-multipla
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { getBankSchema } from '../src/schemas'
import { extractLineFields } from '../src/parser/field-extractor'
import { FixtureMetadata } from '../src/types/fixture-metadata'
import { BANK_CODES } from '../src/types'

// Configuração de bancos disponíveis
const AVAILABLE_BANKS = {
  [BANK_CODES.BANCO_DO_BRASIL]: 'Banco do Brasil',
  [BANK_CODES.SANTANDER]: 'Santander',
  [BANK_CODES.CAIXA]: 'Caixa',
  [BANK_CODES.BRADESCO]: 'Bradesco',
  [BANK_CODES.ITAU]: 'Itaú',
  [BANK_CODES.SICREDI]: 'Sicredi',
  [BANK_CODES.SICOOB]: 'Sicoob',
}

const BANK_SLUGS: Record<string, string> = {
  [BANK_CODES.BANCO_DO_BRASIL]: 'bancoDoBrasil',
  [BANK_CODES.SANTANDER]: 'santander',
  [BANK_CODES.CAIXA]: 'caixa',
  [BANK_CODES.BRADESCO]: 'bradesco',
  [BANK_CODES.ITAU]: 'itau',
  [BANK_CODES.SICREDI]: 'sicredi',
  [BANK_CODES.SICOOB]: 'sicoob',
}

interface CLIOptions {
  bank?: string
  format?: 'CNAB240' | 'CNAB400'
  fixture?: string
}

// Parse argumentos da linha de comando
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {}

  for (const arg of args) {
    if (arg.startsWith('--bank=')) {
      options.bank = arg.split('=')[1]
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1] as 'CNAB240' | 'CNAB400'
    } else if (arg.startsWith('--fixture=')) {
      options.fixture = arg.split('=')[1]
    }
  }

  return options
}

// Interface para readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

// Função para formatar CEP
function formatZipCode(cep: string): string {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return cep
  return `${clean.slice(0, 5)}-${clean.slice(5)}`
}

// Gera metadados JSON a partir do TXT
function generateMetadataFromTxt(
  txtPath: string,
  bankCode: string,
  format: 'CNAB240' | 'CNAB400'
): FixtureMetadata {
  const content = fs.readFileSync(txtPath, 'utf-8')
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)

  const formatCode = format === 'CNAB240' ? 'cnab240' : 'cnab400'
  const schema = getBankSchema(bankCode, formatCode)
  if (!schema) {
    throw new Error(`Schema não encontrado para banco ${bankCode} ${format}`)
  }

  const bankName = AVAILABLE_BANKS[bankCode as keyof typeof AVAILABLE_BANKS]

  // Extrair header
  const headerLine = lines[0]
  const headerParsed = extractLineFields(headerLine, schema.header || {})

  const dataGeracao = headerParsed.data_geracao?.raw || headerParsed.data_arquivo?.raw || ''
  const cedenteNome = String(headerParsed.nome_empresa?.value || headerParsed.cedente_nome?.value || '')

  // Processar detalhes
  const records = []
  let totalAmount = 0
  let messageLines = 0

  if (format === 'CNAB240') {
    // CNAB 240: pares de segmentos P + Q
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i]
      if (line[13] === 'P') {
        // Segmento P
        const segP = extractLineFields(line, schema.segmentoP!)
        const segQ = i + 1 < lines.length ? extractLineFields(lines[i + 1], schema.segmentoQ!) : null

        const valor = Number(segP.valor_titulo?.value || 0)
        const vencimento = String(segP.vencimento?.raw || '')
        const documento = String(segQ?.sacado_numero_inscricao?.raw || '')
        const tipoInscricao = String(segQ?.sacado_codigo_inscricao?.raw || '')
        const nome = String(segQ?.sacado_nome?.value || '')
        const logradouro = String(segQ?.sacado_logradouro?.value || '')
        const cep = String(segQ?.sacado_cep?.raw || '')

        records.push({
          index: records.length + 1,
          name: nome.trim(),
          document: documento.trim(),
          documentRaw: documento,
          documentType: (tipoInscricao === '1' ? 'CPF' : 'CNPJ') as 'CPF' | 'CNPJ',
          documentTypeCode: tipoInscricao,
          amount: valor,
          amountRaw: String(segP.valor_titulo?.raw || ''),
          dueDate: vencimento
            ? `${vencimento.slice(0, 2)}/${vencimento.slice(2, 4)}/${vencimento.slice(4, 8)}`
            : '',
          dueDateRaw: vencimento,
          address: logradouro.trim(),
          zipCode: formatZipCode(cep),
        })

        totalAmount += valor
        i++ // Pular segmento Q
      }
    }
  } else {
    // CNAB 400: cada linha de detalhe tipo '1'; tipo '2' é mensagem livre (não vira record)
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i]
      if (line[0] === '2') {
        messageLines++
        continue
      }
      if (line[0] === '1') {
        const detail = extractLineFields(line, schema.detail!)

        const valor = Number(detail.valor_titulo?.value || 0)
        const vencimento = String(detail.vencimento?.raw || '')
        const documento = String(detail.sacado_numero_inscricao?.raw || '')
        const tipoInscricao = String(detail.sacado_codigo_inscricao?.raw || '')
        const nome = String(detail.nome?.value || '')
        const logradouro = String(detail.logradouro?.value || '')
        const cep = String(detail.cep?.raw || '')
        const cidade = String(detail.cidade?.value || '').trim()
        const estado = String(detail.estado?.value || '').trim()
        const numeroDocumento = String(detail.numero_documento?.value || '').trim()
        const nossoNumero = String(detail.nosso_numero?.raw || '')

        records.push({
          index: records.length + 1,
          name: nome.trim(),
          document: documento.trim(),
          documentRaw: documento,
          documentType: (tipoInscricao === '01' ? 'CPF' : 'CNPJ') as 'CPF' | 'CNPJ',
          documentTypeCode: tipoInscricao,
          amount: valor,
          amountRaw: String(detail.valor_titulo?.raw || ''),
          dueDate: vencimento
            ? `${vencimento.slice(0, 2)}/${vencimento.slice(2, 4)}/20${vencimento.slice(4, 6)}`
            : '',
          dueDateRaw: vencimento,
          address: logradouro.trim(),
          zipCode: cep ? formatZipCode(cep) : '',
          city: cidade,
          state: estado,
          numeroDocumento: numeroDocumento,
          nossoNumero: nossoNumero,
        })

        totalAmount += valor
      }
    }
  }

  const detailLines = format === 'CNAB240' ? records.length * 2 : records.length

  const metadata: FixtureMetadata = {
    description: `Arquivo de remessa ${format} ${bankName} com múltiplos títulos`,
    bankCode,
    bankName,
    format,
    structure: {
      totalLines: lines.length,
      headerLines: 1,
      detailLines,
      trailerLines: 1,
      ...(format === 'CNAB400' ? { messageLines } : {}),
    },
    header: {
      cedenteNome: cedenteNome.trim(),
      dataGeracao: dataGeracao
        ? `${dataGeracao.slice(0, 2)}/${dataGeracao.slice(2, 4)}/${format === 'CNAB240' ? dataGeracao.slice(4, 8) : '20' + dataGeracao.slice(4, 6)}`
        : '',
      dataGeracaoRaw: dataGeracao,
      tipoArquivo: String(headerParsed.tipo_operacao?.raw || '1'),
    },
    records,
    totals: {
      recordCount: records.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    },
  }

  return metadata
}

async function main() {
  console.log('🚀 Gerador de Metadados CNAB\n')

  const cliOptions = parseArgs()

  let bankCode = cliOptions.bank
  let format = cliOptions.format
  let fixtureName = cliOptions.fixture

  // Perguntar banco se não foi passado
  if (!bankCode) {
    console.log('Bancos disponíveis:')
    Object.entries(AVAILABLE_BANKS).forEach(([code, name]) => {
      console.log(`  ${code} - ${name}`)
    })

    bankCode = await question('\n🏦 Código do banco (ex: 237): ')

    if (!AVAILABLE_BANKS[bankCode as keyof typeof AVAILABLE_BANKS]) {
      console.error(`❌ Banco ${bankCode} não suportado`)
      rl.close()
      process.exit(1)
    }
  }

  const bankName = AVAILABLE_BANKS[bankCode as keyof typeof AVAILABLE_BANKS]
  const bankSlug = BANK_SLUGS[bankCode]

  // Perguntar formato se não foi passado
  if (!format) {
    const formatInput = await question('📄 Formato (240 ou 400): ')
    format = formatInput === '240' ? 'CNAB240' : 'CNAB400'
  }

  const formatLower = format.toLowerCase()

  // Perguntar nome do fixture se não foi passado
  if (!fixtureName) {
    fixtureName = await question('📝 Nome do fixture (ex: remessa-multipla): ')
  }

  rl.close()

  // Caminhos
  const fixtureDir = path.join(
    process.cwd(),
    'tests',
    'fixtures',
    formatLower,
    bankSlug
  )
  const txtPath = path.join(fixtureDir, `${fixtureName}.txt`)
  const jsonPath = path.join(fixtureDir, `${fixtureName}.json`)

  // Verificar se TXT existe
  if (!fs.existsSync(txtPath)) {
    console.error(`\n❌ Arquivo não encontrado: ${txtPath}`)
    console.log('\n💡 Primeiro crie o arquivo TXT com os dados CNAB.')
    process.exit(1)
  }

  console.log(`\n📂 Processando: ${txtPath}`)

  try {
    // Gerar metadados
    const metadata = generateMetadataFromTxt(txtPath, bankCode, format)

    // Salvar JSON
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), 'utf-8')

    console.log(`\n✅ Metadados gerados com sucesso!`)
    console.log(`📄 JSON salvo em: ${jsonPath}`)
    console.log(`\n📊 Resumo:`)
    console.log(`   - Banco: ${bankName} (${bankCode})`)
    console.log(`   - Formato: ${format}`)
    console.log(`   - Total de linhas: ${metadata.structure.totalLines}`)
    console.log(`   - Registros: ${metadata.totals.recordCount}`)
    console.log(`   - Valor total: R$ ${metadata.totals.totalAmount.toFixed(2)}`)
    console.log(`\n🎯 Próximo passo: Criar arquivo de teste`)
    console.log(`   ${fixtureDir}/${fixtureName}.test.ts`)
  } catch (error) {
    console.error(`\n❌ Erro ao gerar metadados:`)
    console.error(error)
    process.exit(1)
  }
}

main()
