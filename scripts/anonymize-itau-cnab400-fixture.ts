#!/usr/bin/env ts-node
/**
 * Script one-off para anonimizar a fixture CNAB 400 do Itaú (dados reais de
 * empresas reais -> dados fictícios), preservando exatamente a estrutura/posições
 * do layout e recalculando o metadata.json a partir do REM novo.
 *
 * Uso: npx ts-node scripts/anonymize-itau-cnab400-fixture.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../src/parser/field-extractor'
import { itauCnab400 } from '../src/banks/itau/schemas/cnab400'

const FIXTURE_DIR = path.join(__dirname, '..', 'tests', 'fixtures', 'cnab400', 'itau')
const REM_PATH = path.join(FIXTURE_DIR, 'ITAU_cnab_400.REM')
const JSON_PATH = path.join(FIXTURE_DIR, 'ITAU_cnab_400.json')

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
  // Base >= 10^11 garante 12 dígitos sem zero à esquerda. Faixa de seed própria
  // do Itaú (diferente da usada nos anonimizadores do BB e do Bradesco).
  const base = String(300000000000 + seed * 9973).slice(-12)
  return base + cnpjCheckDigits(base)
}

// ---------- pools de nomes fictícios (mesma convenção dos outros anonimizadores) ----------

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
  'MATERIAIS DE CONSTRUCAO',
  'CONFECCOES',
  'ALIMENTOS',
  'FERRAGENS',
  'PECAS E ACESSORIOS',
  'MAGAZINE',
  'ARMARINHOS',
  'SUPERMERCADO',
  'MOVEIS E DECORACOES',
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
  'SOL NASCENTE',
  'ESTRELA',
  'HORIZONTE',
  'PRIMAVERA',
  'CENTRAL',
  'UNIAO',
  'PROGRESSO',
  'MODELO',
  'PADRAO',
  'CONFIANCA',
  'ALIANCA',
  'TRIUNFO',
  'VITORIA',
  'ATLANTICO',
  'PLANALTO',
  'CERRADO',
  'LITORAL',
  'SERTAO',
  'PIONEIRA',
  'ESPERANCA',
]

const SUFFIXES = ['LTDA', 'LTDA', 'LTDA', 'ME', 'EIRELI']

const FIRST_NAMES = [
  'JOAO',
  'MARIA',
  'JOSE',
  'ANTONIO',
  'FRANCISCO',
  'PAULO',
  'PEDRO',
  'LUCAS',
  'MARCOS',
  'RAFAEL',
  'CARLOS',
  'FERNANDA',
  'JULIANA',
  'PATRICIA',
  'SANDRA',
]

const FAKE_SURNAME_TOKENS = ['EXEMPLO', 'MODELO', 'FICTICIO', 'AMOSTRA', 'GENERICO', 'TESTE']

function buildCorpName(index: number): string {
  const word = BUSINESS_WORDS[index % BUSINESS_WORDS.length]
  const token = NAME_TOKENS[Math.floor(index / BUSINESS_WORDS.length) % NAME_TOKENS.length]
  const suffix = SUFFIXES[index % SUFFIXES.length]
  return `${word} ${token} ${suffix}`
}

function buildPersonName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const surname = FAKE_SURNAME_TOKENS[index % FAKE_SURNAME_TOKENS.length]
  const suffix = index % 2 === 0 ? ' - ME' : ''
  return `${first} ${surname} SILVA${suffix}`
}

function buildAddress(index: number): string {
  const kind = index % 3 === 0 ? 'AV' : 'RUA'
  const num = 100 + index * 7
  return `${kind} EXEMPLO ${num}`
}

// ---------- programa principal ----------

function main() {
  const rawContent = fs.readFileSync(REM_PATH, 'latin1')
  const usesCRLF = rawContent.includes('\r\n')
  const lines = rawContent.split(/\r?\n/).filter((l) => l.length > 0)

  const detailIndexes: number[] = []
  lines.forEach((line, i) => {
    if (line[0] === '1') detailIndexes.push(i)
  })

  console.log(`Total de linhas: ${lines.length}, detalhes (tipo 1): ${detailIndexes.length}`)

  // --- 1. Identidade fictícia do cedente (mesma usada nos outros anonimizadores,
  //     já que é a mesma empresa real remetendo por bancos diferentes) ---
  const fakeCedenteName = 'EMPRESA EXEMPLO IMPORT LTDA'
  const fakeCedenteCnpj = makeFakeCnpj(9001)
  const fakeAgencia = '4521'
  const fakeConta = '54321'

  // --- 2. Mapear cada CNPJ/CPF real de sacado para uma identidade fictícia ---
  type FakeSacado = { name: string; cnpj: string; address: string }
  const sacadoMap = new Map<string, FakeSacado>()
  let corpCounter = 0
  let personCounter = 0

  // Sacados cujo nome real já indica pessoa física (MEs de nome próprio) — mantém
  // a mesma proporção pessoa/empresa da fixture original.
  const personNamePatterns = [
    /^[A-Z]\.\s?[A-Z]\.?\s/, // iniciais tipo "J. C." ou "A. C."
    / - (COMERCIO|ME)$/,
  ]

  for (const i of detailIndexes) {
    const detail = extractLineFields(lines[i], itauCnab400.detail!)
    const realDoc = detail.sacado_numero_inscricao.raw
    const realName = String(detail.nome.value).trim()

    if (!sacadoMap.has(realDoc)) {
      const looksLikePerson = personNamePatterns.some((re) => re.test(realName))
      if (looksLikePerson) {
        sacadoMap.set(realDoc, {
          name: buildPersonName(personCounter++),
          cnpj: makeFakeCnpj(1000 + sacadoMap.size),
          address: buildAddress(sacadoMap.size),
        })
      } else {
        sacadoMap.set(realDoc, {
          name: buildCorpName(corpCounter++),
          cnpj: makeFakeCnpj(1000 + sacadoMap.size),
          address: buildAddress(sacadoMap.size),
        })
      }
    }
  }

  console.log(`Sacados únicos mapeados: ${sacadoMap.size}`)

  // --- 3. Reescrever header ---
  let newHeaderLine = lines[0]
  const hFields = itauCnab400.header!
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.agencia.pos as [number, number]), padNum(fakeAgencia, 4))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.conta.pos as [number, number]), padNum(fakeConta, 5))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.nome_empresa.pos as [number, number]), padAlfa(fakeCedenteName, 30))
  lines[0] = newHeaderLine

  // --- 4. Reescrever cada linha de detalhe (tipo 1) ---
  const dFields = itauCnab400.detail!
  for (const i of detailIndexes) {
    let line = lines[i]
    const detail = extractLineFields(line, dFields)
    const realDoc = detail.sacado_numero_inscricao.raw
    const fake = sacadoMap.get(realDoc)!

    line = spliceField(line, ...(dFields.numero_inscricao.pos as [number, number]), padNum(fakeCedenteCnpj, 14))
    line = spliceField(line, ...(dFields.agencia.pos as [number, number]), padNum(fakeAgencia, 4))
    line = spliceField(line, ...(dFields.conta.pos as [number, number]), padNum(fakeConta, 5))
    line = spliceField(line, ...(dFields.sacado_numero_inscricao.pos as [number, number]), padNum(fake.cnpj, 14))
    line = spliceField(line, ...(dFields.nome.pos as [number, number]), padAlfa(fake.name, 40))
    line = spliceField(line, ...(dFields.logradouro.pos as [number, number]), padAlfa(fake.address, 40))

    if (line.length !== 400) {
      throw new Error(`Linha ${i} ficou com ${line.length} caracteres (esperado 400)`)
    }

    lines[i] = line
  }

  // --- 5. Gravar novo REM ---
  const eol = usesCRLF ? '\r\n' : '\n'
  const newContent = lines.join(eol) + eol
  fs.writeFileSync(REM_PATH, newContent, 'latin1')
  console.log(`REM regravado: ${REM_PATH}`)

  // --- 6. Regerar JSON a partir do REM novo (mesma forma do arquivo atual) ---
  const newHeaderParsed = extractLineFields(lines[0], hFields)
  const dataGeracaoRaw = String(newHeaderParsed.data_geracao.raw)

  const records = detailIndexes.map((i, idx) => {
    const detail = extractLineFields(lines[i], dFields)
    const documentoRawFull = String(detail.sacado_numero_inscricao.raw)
    const documentoSemZeros = documentoRawFull.replace(/^0+/, '') || '0'
    const tipoInscricao = String(detail.sacado_codigo_inscricao.raw)
    const vencimento = String(detail.vencimento.raw)

    return {
      index: idx + 1,
      name: String(detail.nome.value).trim(),
      document: documentoSemZeros,
      documentRaw: documentoRawFull,
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
      city: String(detail.cidade.value).trim(),
      state: String(detail.estado.value).trim(),
      numeroDocumento: String(detail.numero_documento.value).trim(),
      nossoNumero: String(detail.nosso_numero.raw),
    }
  })

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
  const messageLines = lines.filter((l) => l[0] === '2').length

  const metadata = {
    description: `Arquivo CNAB 400 Itaú com ${records.length} títulos - Remessa de cobrança (${lines.length} linhas: 1 header + ${records.length} tipo 1 + ${messageLines} tipo 2 + 1 trailer) (dados fictícios)`,
    bankCode: '341',
    bankName: 'Itaú',
    format: 'CNAB400',
    structure: {
      totalLines: lines.length,
      headerLines: 1,
      detailLines: records.length,
      messageLines,
      trailerLines: 1,
    },
    header: {
      cedenteNome: String(newHeaderParsed.nome_empresa.value).trim(),
      cedenteCNPJ: '',
      agencia: String(newHeaderParsed.agencia.raw),
      conta: String(newHeaderParsed.conta.raw),
      dac: String(newHeaderParsed.dac.value).trim(),
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
  console.log('Total:', metadata.totals.totalAmount)
}

main()
