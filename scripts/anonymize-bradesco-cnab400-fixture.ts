#!/usr/bin/env ts-node
/**
 * Script one-off para anonimizar a fixture CNAB 400 do Bradesco (dados reais de
 * empresas reais -> dados fictícios), preservando exatamente a estrutura/posições
 * do layout e recalculando o metadata.json a partir do TXT novo.
 *
 * Uso: npx ts-node scripts/anonymize-bradesco-cnab400-fixture.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../src/parser/field-extractor'
import { BRADESCO_CNAB400_HEADER_REMESSA, BRADESCO_CNAB400_DETAIL } from '../src/banks/bradesco/schemas/cnab400'

const FIXTURE_DIR = path.join(__dirname, '..', 'tests', 'fixtures', 'cnab400', 'bradesco')
const TXT_PATH = path.join(FIXTURE_DIR, 'remessa-multipla.txt')
const JSON_PATH = path.join(FIXTURE_DIR, 'remessa-multipla.json')

// ---------- helpers de baixo nível ----------

function padNum(value: string | number, size: number): string {
  return String(value).replace(/\D/g, '').padStart(size, '0').slice(-size)
}

function padAlfa(value: string, size: number): string {
  return value.toUpperCase().slice(0, size).padEnd(size, ' ')
}

function spliceField(line: string, start: number, end: number, replacement: string): string {
  return line.slice(0, start - 1) + replacement + line.slice(end)
}

function cnpjCheckDigits(base12: string): string {
  const calc = (digits: string, weights: number[]): number => {
    const sum = digits.split('').reduce((acc, d, i) => acc + parseInt(d, 10) * weights[i], 0)
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = calc(base12, w1)
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d2 = calc(base12 + d1, w2)
  return `${d1}${d2}`
}

function makeFakeCnpj(seed: number): string {
  // Base >= 10^11 garante 12 dígitos sem zero à esquerda (senão o parser numérico
  // remove esse zero na leitura e quebra a comparação exata com o JSON de metadados).
  // Faixa de seed diferente da usada no anonimizador do BB, para não colidir.
  const base = String(200000000000 + seed * 9973).slice(-12)
  return base + cnpjCheckDigits(base)
}

// ---------- pools de nomes fictícios (mesma convenção do anonimizador do BB) ----------

const BUSINESS_WORDS = [
  'COMERCIAL',
  'DISTRIBUIDORA',
  'ATACADISTA',
  'COMERCIO E DISTRIBUICAO',
  'IMPORTACAO E EXPORTACAO',
  'UTILIDADES',
  'VARIEDADES',
  'TRANSPORTES',
  'CONSTRUCOES',
  'EMBALAGENS',
  'MODA E CONFECCOES',
]

const NAME_TOKENS = [
  'ALFA',
  'BETA',
  'GAMA',
  'DELTA',
  'OMEGA',
  'SIGMA',
  'NOVA ERA',
  'BOA VISTA',
  'PORTO NOVO',
  'VALE VERDE',
  'HORIZONTE',
]

const SUFFIXES = ['LTDA', 'LTDA', 'LTDA', 'ME', 'EIRELI']

function buildCorpName(index: number): string {
  const word = BUSINESS_WORDS[index % BUSINESS_WORDS.length]
  const token = NAME_TOKENS[Math.floor(index / BUSINESS_WORDS.length) % NAME_TOKENS.length]
  const suffix = SUFFIXES[index % SUFFIXES.length]
  return `${word} ${token} ${suffix}`
}

function buildAddress(index: number): string {
  const kind = index % 3 === 0 ? 'AV' : 'RUA'
  const num = 200 + index * 11
  return `${kind} EXEMPLO ${num}`
}

// ---------- programa principal ----------

function main() {
  const rawContent = fs.readFileSync(TXT_PATH, 'latin1')
  const usesCRLF = rawContent.includes('\r\n')
  const lines = rawContent.split(/\r?\n/).filter((l) => l.length > 0)

  const headerLine = lines[0]
  const detailIndexes: number[] = []
  lines.forEach((line, i) => {
    if (line[0] === '1') detailIndexes.push(i)
  })

  console.log(`Total de linhas: ${lines.length}, detalhes (tipo 1): ${detailIndexes.length}`)

  // --- 1. Identidade fictícia do cedente (mesma usada no anonimizador do BB,
  //     já que é a mesma empresa real remetendo por bancos diferentes) ---
  const fakeCedenteName = 'EMPRESA EXEMPLO IMPORT LTDA'
  const fakeCodigoCedente = padNum('912345678', 20)
  const fakeAgenciaCedente = '00088'
  const fakeContaCedente = '1234567'

  // --- 2. Mapear cada CNPJ/CPF real de sacado para uma identidade fictícia ---
  type FakeSacado = { name: string; cnpj: string; address: string }
  const sacadoMap = new Map<string, FakeSacado>()
  let sacadoCounter = 0

  for (const i of detailIndexes) {
    const detail = extractLineFields(lines[i], BRADESCO_CNAB400_DETAIL)
    const realDoc = detail.sacado_numero_inscricao.raw

    if (!sacadoMap.has(realDoc)) {
      const idx = sacadoCounter++
      sacadoMap.set(realDoc, {
        name: buildCorpName(idx),
        cnpj: makeFakeCnpj(idx + 1),
        address: buildAddress(idx),
      })
    }
  }

  console.log(`Sacados únicos mapeados: ${sacadoMap.size}`)

  // --- 3. Reescrever header ---
  let newHeaderLine = headerLine
  const hFields = BRADESCO_CNAB400_HEADER_REMESSA
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.codigo_cedente.pos as [number, number]), padAlfa(fakeCodigoCedente, 20))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.nome_empresa.pos as [number, number]), padAlfa(fakeCedenteName, 30))
  lines[0] = newHeaderLine

  // --- 4. Reescrever cada linha de detalhe (tipo 1) ---
  const dFields = BRADESCO_CNAB400_DETAIL
  for (const i of detailIndexes) {
    let line = lines[i]
    const detail = extractLineFields(line, dFields)
    const realDoc = detail.sacado_numero_inscricao.raw
    const fake = sacadoMap.get(realDoc)!

    line = spliceField(line, ...(dFields.agencia_cedente.pos as [number, number]), padNum(fakeAgenciaCedente, 5))
    line = spliceField(line, ...(dFields.conta_cedente.pos as [number, number]), padNum(fakeContaCedente, 7))
    line = spliceField(line, ...(dFields.sacado_numero_inscricao.pos as [number, number]), padNum(fake.cnpj, 14))
    line = spliceField(line, ...(dFields.nome.pos as [number, number]), padAlfa(fake.name, 40))
    line = spliceField(line, ...(dFields.logradouro.pos as [number, number]), padAlfa(fake.address, 40))

    if (line.length !== 400) {
      throw new Error(`Linha ${i} ficou com ${line.length} caracteres (esperado 400)`)
    }

    lines[i] = line
  }

  // --- 5. Gravar novo TXT ---
  const eol = usesCRLF ? '\r\n' : '\n'
  const newContent = lines.join(eol) + eol
  fs.writeFileSync(TXT_PATH, newContent, 'latin1')
  console.log(`TXT regravado: ${TXT_PATH}`)

  // --- 6. Regerar JSON a partir do TXT novo (mesma forma do arquivo atual) ---
  const newHeaderParsed = extractLineFields(lines[0], hFields)
  const dataGeracaoRaw = String(newHeaderParsed.data_geracao.raw)

  const records = detailIndexes.map((i, idx) => {
    const detail = extractLineFields(lines[i], dFields)
    const documentoRaw = String(detail.sacado_numero_inscricao.raw)
    const tipoInscricao = String(detail.sacado_codigo_inscricao.raw)
    const vencimento = String(detail.vencimento.raw)

    return {
      index: idx + 1,
      name: String(detail.nome.value).trim(),
      document: documentoRaw,
      documentRaw: documentoRaw,
      documentType: tipoInscricao === '01' ? 'CPF' : 'CNPJ',
      documentTypeCode: tipoInscricao,
      amount: Number(detail.valor_titulo.value),
      amountRaw: String(detail.valor_titulo.raw),
      dueDate: vencimento
        ? `${vencimento.slice(0, 2)}/${vencimento.slice(2, 4)}/20${vencimento.slice(4, 6)}`
        : '',
      dueDateRaw: vencimento,
      address: String(detail.logradouro.value).trim(),
      zipCode: (() => {
        const cep = String(detail.cep.raw)
        return cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep
      })(),
    }
  })

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
  const messageLines = lines.filter((l) => l[0] === '2').length

  const metadata = {
    description: 'Arquivo de remessa CNAB400 Bradesco com múltiplos títulos (dados fictícios)',
    bankCode: '237',
    bankName: 'Bradesco',
    format: 'CNAB400',
    structure: {
      totalLines: lines.length,
      headerLines: 1,
      detailLines: records.length,
      trailerLines: 1,
      messageLines,
    },
    header: {
      cedenteNome: String(newHeaderParsed.nome_empresa.value).trim(),
      dataGeracao: `${dataGeracaoRaw.slice(0, 2)}/${dataGeracaoRaw.slice(2, 4)}/20${dataGeracaoRaw.slice(4, 6)}`,
      dataGeracaoRaw,
      tipoArquivo: String(newHeaderParsed.tipo_operacao.raw),
    },
    records,
    totals: {
      recordCount: records.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    },
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(metadata, null, 2) + '\n', 'utf-8')
  console.log(`JSON regravado: ${JSON_PATH}`)
  console.log('Primeiro registro:', records[0])
}

main()
