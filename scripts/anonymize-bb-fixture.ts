#!/usr/bin/env ts-node
/**
 * Script one-off para anonimizar a fixture do Banco do Brasil (dados reais de
 * empresas reais -> dados fictícios), preservando exatamente a estrutura/posições
 * do layout CNAB 400 do BB e recalculando o metadata.json a partir do TXT novo.
 *
 * Uso: npx ts-node scripts/anonymize-bb-fixture.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../src/parser/field-extractor'
import { bancoDoBrasilCnab400 } from '../src/banks/bancoDoBrasil/schemas/cnab400'

const FIXTURE_DIR = path.join(__dirname, '..', 'tests', 'fixtures', 'cnab400', 'bancodobrasil')
const REM_PATH = path.join(FIXTURE_DIR, 'BANCOBRASIL_cnab_400.REM')
const JSON_PATH = path.join(FIXTURE_DIR, 'BANCOBRASIL_cnab_400.json')

// ---------- helpers de baixo nível ----------

function padNum(value: string | number, size: number): string {
  return String(value).replace(/\D/g, '').padStart(size, '0').slice(-size)
}

function padAlfa(value: string, size: number): string {
  return value.toUpperCase().slice(0, size).padEnd(size, ' ')
}

function spliceField(line: string, start: number, end: number, replacement: string): string {
  // start/end são 1-indexados e inclusivos, iguais ao schema
  return line.slice(0, start - 1) + replacement + line.slice(end)
}

function cnpjCheckDigits(base12: string): string {
  const calc = (digits: string, weights: number[]): number => {
    const sum = digits
      .split('')
      .reduce((acc, d, i) => acc + parseInt(d, 10) * weights[i], 0)
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
  // base determinística (não sequência repetida, não é um CNPJ real conhecido)
  const base = String(10000000000 + seed * 9973).padStart(12, '0').slice(-12)
  return base + cnpjCheckDigits(base)
}

// ---------- pools de nomes fictícios ----------

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

  if (lines.length !== 228) {
    throw new Error(`Esperava 228 linhas, encontrei ${lines.length}`)
  }

  // --- 1. Gerar identidade fictícia do cedente ---
  const fakeCedenteName = 'EMPRESA EXEMPLO IMPORT LTDA'
  const fakeCedenteCnpj = makeFakeCnpj(9001)
  const fakeAgencia = '4321'
  const fakeConta = '00012345'
  const fakeConvenio = '9007654'

  // --- 2. Mapear cada CNPJ/CPF real de sacado para uma identidade fictícia ---
  const headerLine = lines[0]
  const detailIndexes: number[] = []
  lines.forEach((line, i) => {
    if (line[0] === '7') detailIndexes.push(i)
  })

  type FakeSacado = { name: string; cnpj: string; address: string }
  const sacadoMap = new Map<string, FakeSacado>()
  let sacadoCounter = 0

  for (const i of detailIndexes) {
    const detail = extractLineFields(lines[i], bancoDoBrasilCnab400.detail!)
    const realDoc = detail.sacado_numero_inscricao.raw

    if (!sacadoMap.has(realDoc)) {
      const idx = sacadoCounter++
      const isPerson = ['53179314000160', '14527148000193', '02625232000160', '60022789000103', '00300151000165'].includes(
        realDoc.replace(/^0+/, '').padStart(14, '0'),
      )
      sacadoMap.set(realDoc, {
        name: isPerson ? buildPersonName(idx) : buildCorpName(idx),
        cnpj: makeFakeCnpj(idx + 1),
        address: buildAddress(idx),
      })
    }
  }

  console.log(`Sacados únicos mapeados: ${sacadoMap.size}`)

  // --- 3. Reescrever header ---
  let newHeaderLine = headerLine
  const hFields = bancoDoBrasilCnab400.header!
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.agencia.pos as [number, number]), padNum(fakeAgencia, 4))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.conta.pos as [number, number]), padNum(fakeConta, 8))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.nome_empresa.pos as [number, number]), padAlfa(fakeCedenteName, 30))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.convenio_lider.pos as [number, number]), padNum(fakeConvenio, 7))
  lines[0] = newHeaderLine

  // --- 4. Reescrever cada linha de detalhe (tipo 7) ---
  const dFields = bancoDoBrasilCnab400.detail!
  for (const i of detailIndexes) {
    let line = lines[i]
    const detail = extractLineFields(line, dFields)
    const realDoc = detail.sacado_numero_inscricao.raw
    const fake = sacadoMap.get(realDoc)!

    const nossoNumeroOriginal = detail.nosso_numero.raw
    const nossoNumeroSufixo = nossoNumeroOriginal.slice(-10)
    const novoNossoNumero = padNum(fakeConvenio, 7) + nossoNumeroSufixo

    line = spliceField(line, ...(dFields.numero_inscricao_cedente.pos as [number, number]), padNum(fakeCedenteCnpj, 14))
    line = spliceField(line, ...(dFields.agencia.pos as [number, number]), padNum(fakeAgencia, 4))
    line = spliceField(line, ...(dFields.conta.pos as [number, number]), padNum(fakeConta, 8))
    line = spliceField(line, ...(dFields.convenio.pos as [number, number]), padNum(fakeConvenio, 7))
    line = spliceField(line, ...(dFields.nosso_numero.pos as [number, number]), padNum(novoNossoNumero, 17))
    line = spliceField(line, ...(dFields.sacado_numero_inscricao.pos as [number, number]), padNum(fake.cnpj, 14))
    line = spliceField(line, ...(dFields.nome.pos as [number, number]), padAlfa(fake.name, 37))
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
      city: String(detail.cidade.value).trim(),
      state: String(detail.estado.value).trim(),
      numeroDocumento: String(detail.numero_documento.value).trim(),
      nossoNumero: String(detail.nosso_numero.raw),
      comando: String(detail.comando.raw),
    }
  })

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)

  const metadata = {
    description:
      'Arquivo CNAB 400 Banco do Brasil com 113 títulos (dados fictícios) - Remessa de cobrança (228 linhas: 1 header + 113 tipo 7 (detalhe) + 113 tipo 5/99 (multa) + 1 trailer)',
    bankCode: '001',
    bankName: 'Banco do Brasil',
    format: 'CNAB400',
    structure: {
      totalLines: lines.length,
      headerLines: 1,
      detailLines: records.length,
      messageLines: records.length,
      trailerLines: 1,
    },
    header: {
      cedenteNome: String(newHeaderParsed.nome_empresa.value).trim(),
      agencia: String(newHeaderParsed.agencia.raw),
      conta: String(newHeaderParsed.conta.raw),
      contaDv: String(newHeaderParsed.conta_dv.value).trim(),
      sequencialRemessa: String(newHeaderParsed.sequencial_remessa.raw),
      convenioLider: String(newHeaderParsed.convenio_lider.raw),
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
